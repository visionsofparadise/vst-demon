import { describe, expect, it } from "vitest";
import type { ScanEntry } from "../../shared/scan/ScanEntry";
import { filterEntries } from "./filterEntries";

const entry = (name: string): ScanEntry => ({
	entryKey: name,
	name,
	modulePath: `C:\\VST3\\${name}.vst3`,
	rootPath: "C:\\VST3",
	vendorFolder: "Vendor",
	status: "ready",
});

describe("filterEntries", () => {
	const entries = [entry("OTT"), entry("Serum"), entry("Crystalline")];

	it("matches a case-insensitive name substring", () => {
		expect(filterEntries(entries, "cryst").map((e) => e.name)).toEqual(["Crystalline"]);
		expect(filterEntries(entries, "OT").map((e) => e.name)).toEqual(["OTT"]);
	});

	it("returns all entries for an empty or whitespace query", () => {
		expect(filterEntries(entries, "")).toBe(entries);
		expect(filterEntries(entries, "   ")).toBe(entries);
	});

	it("returns an empty array when nothing matches", () => {
		expect(filterEntries(entries, "zzz")).toEqual([]);
	});
});
