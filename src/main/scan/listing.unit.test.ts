import { describe, expect, it } from "vitest";
import { isCrashExit, parseClassNames, tailLines } from "./listing";

describe("isCrashExit", () => {
	it("recognizes both the unsigned and signed 0xC0000005 access-violation codes", () => {
		expect(isCrashExit(3221225477)).toBe(true);
		expect(isCrashExit(-1073741819)).toBe(true);
	});

	it("does not treat a clean exit, a normal error code, or null as a crash", () => {
		expect(isCrashExit(0)).toBe(false);
		expect(isCrashExit(1)).toBe(false);
		expect(isCrashExit(null)).toBe(false);
	});
});

describe("parseClassNames", () => {
	it("parses a JSON array of class names, tolerating surrounding whitespace", () => {
		expect(parseClassNames('  ["REQ 2 Mono","REQ 2 Stereo"]\n')).toEqual(["REQ 2 Mono", "REQ 2 Stereo"]);
	});

	it("throws when stdout is not a JSON string array", () => {
		expect(() => parseClassNames('{"not":"an array"}')).toThrow();
	});
});

describe("tailLines", () => {
	it("returns only the last N non-empty-trimmed lines", () => {
		expect(tailLines("a\nb\nc\nd\ne\nf", 2)).toBe("e\nf");
	});
});
