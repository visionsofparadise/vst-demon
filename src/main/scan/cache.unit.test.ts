import { describe, expect, it } from "vitest";
import { isCacheHit, parseCache, serializeCache, type CacheRecord } from "./cache";

describe("isCacheHit", () => {
	const record: CacheRecord = { size: 100, mtimeMs: 5000, classNames: ["A"] };

	it("hits when size and mtime both match", () => {
		expect(isCacheHit(record, { size: 100, mtimeMs: 5000 })).toBe(true);
	});

	it("misses when size differs", () => {
		expect(isCacheHit(record, { size: 101, mtimeMs: 5000 })).toBe(false);
	});

	it("misses when mtime differs", () => {
		expect(isCacheHit(record, { size: 100, mtimeMs: 5001 })).toBe(false);
	});

	it("misses when there is no record", () => {
		expect(isCacheHit(undefined, { size: 100, mtimeMs: 5000 })).toBe(false);
	});
});

describe("parseCache", () => {
	it("round-trips a valid cache and preserves negative (error) records", () => {
		const cache = {
			"a.vst3": { size: 1, mtimeMs: 2, classNames: ["X", "Y"] },
			"b.vst3": { size: 3, mtimeMs: 4, error: "boom" },
		};

		expect(parseCache(serializeCache(cache))).toEqual(cache);
	});

	it("returns an empty cache when JSON is schema-invalid", () => {
		expect(parseCache(JSON.stringify({ "a.vst3": { size: "not-a-number", mtimeMs: 2, classNames: [] } }))).toEqual({});
	});
});
