import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Logger } from "../shared/models/Logger";
import { defaultScanRoots, readSettings } from "./settings";

describe("readSettings", () => {
	const logger = new Logger("main");

	let tempDir: string;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vst-demon-settings-"));
	});

	afterEach(() => {
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	it("returns defaults when the file is missing", () => {
		expect(readSettings(path.join(tempDir, "settings.json"), logger)).toEqual({ scanRoots: [...defaultScanRoots()] });
	});

	it("returns defaults when the file is malformed", () => {
		const settingsPath = path.join(tempDir, "settings.json");

		fs.writeFileSync(settingsPath, "{ not valid json", "utf8");

		expect(readSettings(settingsPath, logger)).toEqual({ scanRoots: [...defaultScanRoots()] });
	});

	it("returns the stored roots when the file is valid", () => {
		const settingsPath = path.join(tempDir, "settings.json");

		fs.writeFileSync(settingsPath, JSON.stringify({ scanRoots: ["D:\\Plugins"] }), "utf8");

		expect(readSettings(settingsPath, logger)).toEqual({ scanRoots: ["D:\\Plugins"] });
	});
});

describe("defaultScanRoots", () => {
	it("returns the two spec-standard 64-bit VST3 folders on win32", () => {
		if (process.platform !== "win32") return;

		const roots = defaultScanRoots();

		expect(roots).toContain("C:\\Program Files\\Common Files\\VST3");
		expect(roots.some((root) => root.includes("Program Files (x86)"))).toBe(false);
		expect(roots.length).toBe(process.env.LOCALAPPDATA === undefined ? 1 : 2);
	});
});
