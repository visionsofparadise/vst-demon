import { describe, expect, it } from "vitest";
import { parseSettings, serializeSettings, type Settings } from "./Settings";

describe("parseSettings", () => {
	it("parses a valid settings object", () => {
		expect(parseSettings(JSON.stringify({ scanRoots: ["C:\\Plugins"] }))).toEqual({ scanRoots: ["C:\\Plugins"] });
	});

	it("returns undefined for malformed JSON", () => {
		expect(parseSettings("{ not json")).toBeUndefined();
	});

	it("returns undefined when the shape is schema-invalid", () => {
		expect(parseSettings(JSON.stringify({ scanRoots: "x" }))).toBeUndefined();
	});

	it("round-trips through serialize", () => {
		const settings: Settings = { scanRoots: ["C:\\Program Files\\Common Files\\VST3", "D:\\Plugins"] };

		expect(parseSettings(serializeSettings(settings))).toEqual(settings);
	});
});
