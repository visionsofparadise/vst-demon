import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CliManager, type CliEventPayload } from "../src/main/CliManager";
import { Logger } from "../src/shared/models/Logger";
import type { ScanEntry } from "../src/shared/scan/ScanEntry";

const repoRoot = path.resolve(fileURLToPath(import.meta.url), "..", "..");
const cliPath = path.resolve(repoRoot, "binaries", "vst-demon.exe");

const searchRoots: ReadonlyArray<string> = [
	path.join("C:\\", "Program Files", "Common Files", "VST3"),
	...(process.env.LOCALAPPDATA === undefined ? [] : [path.join(process.env.LOCALAPPDATA, "Programs", "Common", "VST3")]),
];

const findOtt = (): string | undefined => {
	const stack = [...searchRoots];

	while (stack.length > 0) {
		const dir = stack.pop();

		if (dir === undefined) continue;

		let entries: Array<fs.Dirent> = [];

		try {
			entries = fs.readdirSync(dir, { withFileTypes: true });
		} catch {
			continue;
		}

		for (const entry of entries) {
			const full = path.join(dir, entry.name);

			if (entry.name === "OTT.vst3") return full;

			if (entry.isDirectory() && !entry.name.endsWith(".vst3")) stack.push(full);
		}
	}

	return undefined;
};

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const main = async (): Promise<void> => {
	const modulePath = findOtt();

	if (modulePath === undefined) {
		console.error("OTT.vst3 not found under any VST3 root — cannot run smoke");
		process.exit(1);
	}

	console.warn(`OTT module: ${modulePath}`);

	const documentsDir = fs.mkdtempSync(path.join(os.tmpdir(), "vst-demon-clismoke-"));
	const presetPath = path.join(documentsDir, "VST Demon", "OTT.vstpreset");

	console.warn(`temp documents: ${documentsDir}`);
	console.warn(`expected preset: ${presetPath}`);

	Logger.level = "warn";
	const logger = new Logger("main");

	const events: Array<CliEventPayload> = [];

	const manager = new CliManager({
		documentsDir,
		cliPath,
		logger,
		onEvent: (payload) => {
			events.push(payload);
			console.warn(`cli:event ${JSON.stringify(payload)}`);
		},
	});

	const spawnId = manager.launch({
		entryKey: modulePath,
		name: "OTT",
		modulePath,
		vendorFolder: "",
		status: "ready",
	});

	console.warn(`spawnId: ${spawnId}`);

	const child = manager["children"].get(spawnId)?.child;
	const pid = child?.pid;

	console.warn(`pid: ${pid ?? "unknown"}`);

	await delay(8000);

	const presetExists = fs.existsSync(presetPath);

	console.warn(`\npreset appeared after 8s: ${presetExists}`);
	console.warn(`event sequence: ${events.map((entry) => entry.event.event).join(", ")}`);

	if (pid !== undefined) {
		try {
			execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
			console.warn(`killed pid ${pid}`);
		} catch (error) {
			console.warn(`taskkill failed: ${String(error)}`);
		}
	}

	await delay(1500);

	console.warn(`\nfinal event sequence: ${events.map((entry) => entry.event.event).join(", ")}`);
	const exited = events.find((entry) => entry.event.event === "exited");

	console.warn(`synthetic exited event: ${exited === undefined ? "NONE" : JSON.stringify(exited.event)}`);

	fs.rmSync(documentsDir, { recursive: true, force: true });
	console.warn(`cleaned up ${documentsDir}`);

	process.exit(0);
};

main().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
