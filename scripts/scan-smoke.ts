import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Logger } from "../src/shared/models/Logger";
import type { ScanEntry } from "../src/shared/scan/ScanEntry";
import { ScanService } from "../src/main/ScanService";
import { defaultScanRoots } from "../src/main/settings";

const repoRoot = path.resolve(fileURLToPath(import.meta.url), "..", "..");
const cliBinary = process.platform === "win32" ? "vst-demon-cli.exe" : "vst-demon-cli";
const cliPath = path.resolve(repoRoot, "binaries", cliBinary);
const cachePath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "vst-demon-smoke-")), "scan-cache.json");

const vst3Roots: ReadonlyArray<string> = defaultScanRoots();

Logger.level = "warn";
const logger = new Logger("main");

let updateCount = 0;

const printSnapshot = (label: string, entries: ReadonlyArray<ScanEntry>): void => {
	const pending = entries.filter((entry) => entry.status === "pending").length;
	const ready = entries.filter((entry) => entry.status === "ready").length;
	const errored = entries.filter((entry) => entry.status === "error").length;

	console.warn(`[${label}] entries=${entries.length} pending=${pending} ready=${ready} error=${errored}`);
};

const printRoster = (entries: ReadonlyArray<ScanEntry>): void => {
	for (const entry of entries) {
		const suffix = entry.className === undefined ? "" : `  [class: ${entry.className}]`;
		const status = entry.status === "error" ? `ERROR: ${entry.error ?? ""}` : entry.status;

		console.warn(`  ${entry.vendorFolder.padEnd(24)} ${entry.name.padEnd(28)} ${status}${suffix}`);
	}
};

const main = async (): Promise<void> => {
	console.warn(`CLI: ${cliPath}`);
	console.warn(`roots: ${vst3Roots.join(" | ")}`);

	const service = new ScanService({
		getRoots: () => vst3Roots,
		cachePath,
		cliPath,
		logger,
		onUpdate: (entries) => {
			updateCount += 1;
			printSnapshot(`update ${updateCount}`, entries);
		},
	});

	const coldStart = Date.now();
	const cold = await service.scan();
	const coldMs = Date.now() - coldStart;

	console.warn(`\n=== FINAL ROSTER (cold, ${coldMs} ms, ${cold.length} entries) ===`);
	printRoster(cold);

	updateCount = 0;
	const warmStart = Date.now();
	const warm = await service.scan();
	const warmMs = Date.now() - warmStart;

	console.warn(`\n=== WARM RESCAN (${warmMs} ms, ${warm.length} entries, ${updateCount} update events) ===`);

	console.warn(`\ncold=${coldMs} ms  warm=${warmMs} ms  cache=${cachePath}`);

	process.exit(0);
};

main().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
