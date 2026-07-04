import { describe, expect, it } from "vitest";
import { sanitizeFilename } from "./sanitizeFilename";

describe("sanitizeFilename", () => {
	it("passes a plain name through unchanged", () => {
		expect(sanitizeFilename("OTT")).toBe("OTT");
	});

	it("turns a shell sub-plugin name into a safe stem", () => {
		expect(sanitizeFilename("REQ 2 Stereo")).toBe("REQ_2_Stereo");
	});

	it("replaces every filename-hostile character", () => {
		expect(sanitizeFilename('a\\b/c:d*e?f"g<h>i|j')).toBe("a_b_c_d_e_f_g_h_i_j");
	});

	it("collapses runs and strips leading and trailing separators", () => {
		expect(sanitizeFilename("  Neutron   2  ")).toBe("Neutron_2");
		expect(sanitizeFilename("--name--")).toBe("name");
	});

	it("falls back to a placeholder when nothing usable remains", () => {
		expect(sanitizeFilename("///")).toBe("untitled");
	});
});
