import { describe, expect, it } from "vitest";
import { parseCliLine } from "./events";

describe("parseCliLine", () => {
	it("parses each of the four stdout events to its discriminated member", () => {
		expect(parseCliLine('{"event":"ready"}')).toEqual({ event: "ready" });
		expect(parseCliLine('{"event":"open","path":"C:\\\\Users\\\\mttcv\\\\Documents\\\\VST Demon\\\\OTT.vstpreset"}')).toEqual({
			event: "open",
			path: "C:\\Users\\mttcv\\Documents\\VST Demon\\OTT.vstpreset",
		});
		expect(parseCliLine('{"event":"saved","path":"C:\\\\Users\\\\mttcv\\\\Documents\\\\VST Demon\\\\OTT.vstpreset"}')).toEqual({
			event: "saved",
			path: "C:\\Users\\mttcv\\Documents\\VST Demon\\OTT.vstpreset",
		});
		expect(parseCliLine('{"event":"closed"}')).toEqual({ event: "closed" });
	});

	it("returns undefined for a garbage line rather than throwing", () => {
		expect(parseCliLine("not json at all")).toBeUndefined();
		expect(parseCliLine('{"event":"unknown"}')).toBeUndefined();
		expect(parseCliLine('{"event":"open"}')).toBeUndefined();
		expect(parseCliLine("")).toBeUndefined();
	});
});
