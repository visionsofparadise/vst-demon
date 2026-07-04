import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import readline from "node:readline";
import type { Logger } from "../shared/models/Logger";
import type { ScanEntry } from "../shared/scan/ScanEntry";
import { parseCliLine, type CliEvent } from "./cli/events";
import { sanitizeFilename } from "./sanitizeFilename";

const PRESET_DIRECTORY_NAME = "VST Demon";
const STDERR_TAIL_LINE_LIMIT = 20;
const STDERR_TAIL_BYTE_LIMIT = 4096;

export interface CliEventPayload {
	readonly spawnId: string;
	readonly entryKey: string;
	readonly event: CliEvent;
}

export interface CliManagerOptions {
	readonly documentsDir: string;
	readonly cliPath: string;
	readonly logger: Logger;
	readonly onEvent: (payload: CliEventPayload) => void;
}

export const presetPathForEntry = (documentsDir: string, entry: ScanEntry): string =>
	path.join(documentsDir, PRESET_DIRECTORY_NAME, `${sanitizeFilename(entry.name)}.vstpreset`);

export const buildLaunchArgs = (entry: ScanEntry, presetPath: string): ReadonlyArray<string> => [
	"--plugin",
	entry.modulePath,
	...(entry.className === undefined ? [] : ["--plugin-name", entry.className]),
	"--preset",
	presetPath,
];

interface TrackedChild {
	readonly child: ChildProcess;
	readonly entryKey: string;
}

export class CliManager {
	private readonly options: CliManagerOptions;
	private readonly children = new Map<string, TrackedChild>();

	constructor(options: CliManagerOptions) {
		this.options = options;
	}

	launch(entry: ScanEntry): string {
		const { documentsDir, cliPath, logger, onEvent } = this.options;
		const presetPath = presetPathForEntry(documentsDir, entry);
		const args = buildLaunchArgs(entry, presetPath);
		const spawnId = crypto.randomUUID();

		const child = spawn(cliPath, [...args], { detached: true, stdio: ["ignore", "pipe", "pipe"] });

		this.children.set(spawnId, { child, entryKey: entry.entryKey });

		logger.info("Launched plugin", { namespace: "cli", spawnId, entryKey: entry.entryKey, modulePath: entry.modulePath, presetPath });

		const emit = (event: CliEvent): void => {
			onEvent({ spawnId, entryKey: entry.entryKey, event });
		};

		const stderrTail = this.consumeStdout(child, spawnId, entry.entryKey, emit);

		child.on("error", (error: Error) => {
			logger.error("CLI child errored", error, { namespace: "cli", spawnId, entryKey: entry.entryKey });
		});

		child.on("close", (code) => {
			this.children.delete(spawnId);

			emit({ event: "exited", code, stderrTail: stderrTail() });
		});

		child.unref();

		return spawnId;
	}

	// Children are spawned detached and must outlive the app; dispose never kills them.
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	dispose(): void {}

	private consumeStdout(child: ChildProcess, spawnId: string, entryKey: string, emit: (event: CliEvent) => void): () => string {
		const stderrChunks: Array<string> = [];
		let stderrBytes = 0;

		if (child.stderr !== null) {
			child.stderr.on("data", (chunk: Buffer) => {
				stderrChunks.push(chunk.toString());
				stderrBytes += chunk.length;

				while (stderrChunks.length > STDERR_TAIL_LINE_LIMIT * 4 || stderrBytes > STDERR_TAIL_BYTE_LIMIT * 2) {
					const removed = stderrChunks.shift();

					if (removed === undefined) break;

					stderrBytes -= Buffer.byteLength(removed);
				}
			});
		}

		if (child.stdout !== null) {
			const lines = readline.createInterface({ input: child.stdout });

			lines.on("line", (line: string) => {
				const event = parseCliLine(line);

				if (event === undefined) {
					this.options.logger.warn("Unparseable CLI stdout line", { namespace: "cli", spawnId, entryKey, line });

					return;
				}

				emit(event);
			});
		}

		return () => {
			const combined = stderrChunks.join("");
			const lines = combined.split(/\r?\n/).filter((line) => line.trim().length > 0);
			const tail = lines.slice(-STDERR_TAIL_LINE_LIMIT).join("\n");

			return tail.length > STDERR_TAIL_BYTE_LIMIT ? tail.slice(-STDERR_TAIL_BYTE_LIMIT) : tail;
		};
	}
}
