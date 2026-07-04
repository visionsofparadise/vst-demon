import type { ScanEntry } from "../../shared/scan/ScanEntry";

export const filterEntries = (entries: ReadonlyArray<ScanEntry>, query: string): ReadonlyArray<ScanEntry> => {
	const needle = query.trim().toLowerCase();

	if (needle.length === 0) return entries;

	return entries.filter((entry) => entry.name.toLowerCase().includes(needle));
};
