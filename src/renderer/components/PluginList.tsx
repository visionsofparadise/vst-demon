import { ChevronDown } from "lucide-react";
import type { ScanEntry } from "../../shared/scan/ScanEntry";
import type { AppContext } from "../models/Context";
import { filterEntries } from "../utilities/filterEntries";
import { PluginRow } from "./PluginRow";

const SKELETON_ROWS = Array.from({ length: 8 }, (_, index) => index);

const EMPTY_MESSAGE = "No VST3 plugins found in the configured folders.";

function SkeletonList() {
	return (
		<ul
			aria-hidden="true"
			className="flex flex-col gap-1 p-2"
		>
			{SKELETON_ROWS.map((index) => (
				<li
					key={index}
					className="flex items-center gap-3 px-3 py-2"
				>
					<span className="flex min-w-0 flex-1 flex-col gap-1.5">
						<span className="h-3.5 w-1/3 rounded bg-[#1b1b1f]" />
						<span className="h-2.5 w-1/5 rounded bg-[#161619]" />
					</span>
				</li>
			))}
		</ul>
	);
}

function EmptyState({ context }: { readonly context: AppContext }) {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
			<p className="max-w-md text-sm text-[#B8B8C0]">{EMPTY_MESSAGE}</p>
			<button
				type="button"
				onClick={context.rescan}
				disabled={context.scanning}
				className="rounded-md border border-[#26262b] bg-[#161619] px-4 py-1.5 text-sm text-[#B8B8C0] outline-none hover:bg-[#1b1b1f] focus-visible:border-[#4a4a52] disabled:opacity-50"
			>
				{context.scanning ? "Scanning…" : "Rescan"}
			</button>
		</div>
	);
}

const groupByRoot = (entries: ReadonlyArray<ScanEntry>): ReadonlyMap<string, ReadonlyArray<ScanEntry>> => {
	const groups = new Map<string, Array<ScanEntry>>();

	for (const entry of entries) {
		const group = groups.get(entry.rootPath);

		if (group === undefined) {
			groups.set(entry.rootPath, [entry]);
		} else {
			group.push(entry);
		}
	}

	return groups;
};

function RootGroup({ rootPath, entries, context }: { readonly rootPath: string; readonly entries: ReadonlyArray<ScanEntry>; readonly context: AppContext }) {
	return (
		<details open className="group">
			<summary className="flex cursor-pointer list-none items-center gap-2 rounded-md px-3 py-2 hover:bg-[#161619] [&::-webkit-details-marker]:hidden">
				<ChevronDown aria-hidden="true" className="size-3.5 shrink-0 text-[#6a6a72] transition-transform group-open:rotate-0 -rotate-90" />
				<span className="min-w-0 flex-1 truncate text-xs text-[#6a6a72]">{rootPath}</span>
				<span className="shrink-0 text-xs text-[#6a6a72]">{entries.length}</span>
			</summary>

			<ul className="flex flex-col gap-1 pt-1">
				{entries.map((entry) => (
					<li key={entry.entryKey}>
						<PluginRow
							entry={entry}
							context={context}
						/>
					</li>
				))}
			</ul>
		</details>
	);
}

export function PluginList({ context }: { readonly context: AppContext }) {
	const { entries, scanning, query } = context;

	if (entries.length === 0 && scanning) return <SkeletonList />;

	if (entries.length === 0) return <EmptyState context={context} />;

	const filtered = filterEntries(entries, query);

	if (filtered.length === 0) {
		return (
			<div className="flex flex-1 items-center justify-center px-8 text-center">
				<p className="text-sm text-[#6a6a72]">No plugins match “{query}”.</p>
			</div>
		);
	}

	const groups = groupByRoot(filtered);

	return (
		<div className="flex flex-col gap-1 overflow-y-auto p-2">
			{[...groups].map(([rootPath, groupEntries]) => (
				<RootGroup
					key={rootPath}
					rootPath={rootPath}
					entries={groupEntries}
					context={context}
				/>
			))}
		</div>
	);
}
