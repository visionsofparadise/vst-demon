import { buildEntryKey, type ScanEntry } from "../../shared/scan/ScanEntry";
import type { WalkModule } from "./walk";

export const derivePendingEntry = (module: WalkModule): ScanEntry => ({
	entryKey: buildEntryKey(module.modulePath),
	name: module.name,
	modulePath: module.modulePath,
	vendorFolder: module.vendorFolder,
	status: "pending",
});

export const deriveReadyEntries = (module: WalkModule, classNames: ReadonlyArray<string>): ReadonlyArray<ScanEntry> => {
	if (classNames.length <= 1) {
		return [
			{
				entryKey: buildEntryKey(module.modulePath),
				name: module.name,
				modulePath: module.modulePath,
				vendorFolder: module.vendorFolder,
				status: "ready",
			},
		];
	}

	return classNames.map((className) => ({
		entryKey: buildEntryKey(module.modulePath, className),
		name: className,
		modulePath: module.modulePath,
		vendorFolder: module.vendorFolder,
		className,
		status: "ready",
	}));
};

export const deriveErrorEntry = (module: WalkModule, error: string): ScanEntry => ({
	entryKey: buildEntryKey(module.modulePath),
	name: module.name,
	modulePath: module.modulePath,
	vendorFolder: module.vendorFolder,
	status: "error",
	error,
});
