import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { walkRoot, type DirentLike, type ReadDirectory } from "./walk";

const dirent = (name: string, isDir: boolean): DirentLike => ({ name, isDirectory: () => isDir });

describe("walkRoot", () => {
	it("treats a .vst3 file and a .vst3 bundle directory both as modules and does not descend into the bundle", () => {
		const tree: Record<string, ReadonlyArray<DirentLike>> = {
			root: [dirent("OTT.vst3", false), dirent("Bundle.vst3", true), dirent("Vendor", true)],
			"root/Bundle.vst3": [dirent("Contents", true)],
			"root/Vendor": [dirent("Plugin.vst3", true)],
		};

		const read: ReadDirectory = (directory) => {
			const key = directory.replace(/\\/g, "/");

			return tree[key] ?? [];
		};

		const modules = walkRoot("root", read);
		const paths = modules.map((module) => module.modulePath.replace(/\\/g, "/"));

		expect(paths).toContain("root/OTT.vst3");
		expect(paths).toContain("root/Bundle.vst3");
		expect(paths).toContain("root/Vendor/Plugin.vst3");
		expect(paths).not.toContain("root/Bundle.vst3/Contents");
	});

	it("captures the top-level vendor folder for a nested module, and the module name itself for a root-level module", () => {
		const tree: Record<string, ReadonlyArray<DirentLike>> = {
			root: [dirent("OTT.vst3", false), dirent("iZotope", true)],
			"root/iZotope": [dirent("Neutron.vst3", true)],
		};

		const read: ReadDirectory = (directory) => tree[directory.replace(/\\/g, "/")] ?? [];

		const modules = walkRoot("root", read);
		const byName = new Map(modules.map((module) => [module.name, module.vendorFolder]));

		expect(byName.get("OTT")).toBe("OTT.vst3");
		expect(byName.get("Neutron")).toBe("iZotope");
	});

	it("skips an unreadable directory via onWarn without failing the walk", () => {
		const read: ReadDirectory = (directory) => {
			if (directory.replace(/\\/g, "/") === "root/Denied") throw new Error("EACCES");

			const tree: Record<string, ReadonlyArray<DirentLike>> = {
				root: [dirent("OTT.vst3", false), dirent("Denied", true)],
			};

			return tree[directory.replace(/\\/g, "/")] ?? [];
		};

		const warned: Array<string> = [];
		const modules = walkRoot("root", read, (directory) => warned.push(directory.replace(/\\/g, "/")));

		expect(modules.map((module) => module.name)).toEqual(["OTT"]);
		expect(warned).toContain("root/Denied");
	});

	it("resolves .vst3 file-vs-bundle duality and no-descent over a real temp-dir tree", () => {
		const root = fs.mkdtempSync(path.join(os.tmpdir(), "vst-demon-walk-"));

		try {
			fs.writeFileSync(path.join(root, "OTT.vst3"), "module");
			fs.mkdirSync(path.join(root, "Bundle.vst3", "Contents"), { recursive: true });
			fs.writeFileSync(path.join(root, "Bundle.vst3", "Contents", "Nested.vst3"), "should-not-be-found");
			fs.mkdirSync(path.join(root, "Vendor"), { recursive: true });
			fs.writeFileSync(path.join(root, "Vendor", "Plugin.vst3"), "module");

			const read: ReadDirectory = (directory) => fs.readdirSync(directory, { withFileTypes: true });
			const modules = walkRoot(root, read);
			const names = modules.map((module) => module.name).sort();

			expect(names).toEqual(["Bundle", "OTT", "Plugin"]);
			expect(modules.map((module) => module.name)).not.toContain("Nested");
		} finally {
			fs.rmSync(root, { recursive: true, force: true });
		}
	});
});
