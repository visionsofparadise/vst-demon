import path from "node:path";
import { describe, expect, it } from "vitest";
import type { ScanEntry } from "../shared/scan/ScanEntry";
import { buildLaunchArgs, presetPathForEntry } from "./CliManager";

const DOCUMENTS_DIR = path.join("C:\\", "Users", "mttcv", "Documents");

const plainEntry: ScanEntry = {
	entryKey: "C:\\Program Files\\Common Files\\VST3\\OTT.vst3",
	name: "OTT",
	modulePath: "C:\\Program Files\\Common Files\\VST3\\OTT.vst3",
	vendorFolder: "Xfer Records",
	status: "ready",
};

const shellEntry: ScanEntry = {
	entryKey: "C:\\Program Files\\Common Files\\VST3\\WaveShell.vst3::REQ 2 Stereo",
	name: "REQ 2 Stereo",
	modulePath: "C:\\Program Files\\Common Files\\VST3\\WaveShell.vst3",
	vendorFolder: "Waves",
	className: "REQ 2 Stereo",
	status: "ready",
};

describe("presetPathForEntry", () => {
	it("targets <documents>/VST Demon/<sanitized name>.vstpreset", () => {
		expect(presetPathForEntry(DOCUMENTS_DIR, plainEntry)).toBe(path.join(DOCUMENTS_DIR, "VST Demon", "OTT.vstpreset"));
		expect(presetPathForEntry(DOCUMENTS_DIR, shellEntry)).toBe(path.join(DOCUMENTS_DIR, "VST Demon", "REQ_2_Stereo.vstpreset"));
	});
});

describe("buildLaunchArgs", () => {
	it("omits --plugin-name for a plain entry", () => {
		const presetPath = presetPathForEntry(DOCUMENTS_DIR, plainEntry);

		expect(buildLaunchArgs(plainEntry, presetPath)).toEqual(["--plugin", plainEntry.modulePath, "--preset", presetPath]);
	});

	it("includes --plugin-name for a shell entry with a className", () => {
		const presetPath = presetPathForEntry(DOCUMENTS_DIR, shellEntry);

		expect(buildLaunchArgs(shellEntry, presetPath)).toEqual(["--plugin", shellEntry.modulePath, "--plugin-name", "REQ 2 Stereo", "--preset", presetPath]);
	});
});
