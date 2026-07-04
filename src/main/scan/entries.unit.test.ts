import { describe, expect, it } from "vitest";
import { deriveErrorEntry, derivePendingEntry, deriveReadyEntries } from "./entries";
import type { WalkModule } from "./walk";

const module: WalkModule = { modulePath: "C:\\VST3\\WaveShell.vst3", vendorFolder: "Waves", name: "WaveShell" };

describe("deriveReadyEntries", () => {
	it("keeps a single entry with the module display name (no className) for a single-class module", () => {
		const entries = deriveReadyEntries(module, ["REQ 2 Stereo"]);

		expect(entries).toEqual([
			{
				entryKey: "C:\\VST3\\WaveShell.vst3",
				name: "WaveShell",
				modulePath: module.modulePath,
				vendorFolder: "Waves",
				status: "ready",
			},
		]);
	});

	it("expands a multi-class shell to one entry per class with a path::class entryKey and className set", () => {
		const entries = deriveReadyEntries(module, ["REQ 2 Mono", "REQ 2 Stereo"]);

		expect(entries).toEqual([
			{
				entryKey: "C:\\VST3\\WaveShell.vst3::REQ 2 Mono",
				name: "REQ 2 Mono",
				modulePath: module.modulePath,
				vendorFolder: "Waves",
				className: "REQ 2 Mono",
				status: "ready",
			},
			{
				entryKey: "C:\\VST3\\WaveShell.vst3::REQ 2 Stereo",
				name: "REQ 2 Stereo",
				modulePath: module.modulePath,
				vendorFolder: "Waves",
				className: "REQ 2 Stereo",
				status: "ready",
			},
		]);
	});

	it("keeps a single non-className entry when the class list is empty", () => {
		const entries = deriveReadyEntries(module, []);

		expect(entries).toHaveLength(1);
		expect(entries[0]?.className).toBeUndefined();
	});
});

describe("derivePendingEntry / deriveErrorEntry", () => {
	it("derives a pending entry keyed by module path", () => {
		expect(derivePendingEntry(module)).toMatchObject({ entryKey: module.modulePath, status: "pending", name: "WaveShell" });
	});

	it("derives an error entry carrying the message", () => {
		expect(deriveErrorEntry(module, "license inactive")).toMatchObject({ status: "error", error: "license inactive", entryKey: module.modulePath });
	});
});
