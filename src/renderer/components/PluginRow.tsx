import { AlertCircle, Loader2 } from "lucide-react";
import type { ScanEntry } from "../../shared/scan/ScanEntry";
import type { AppContext } from "../models/Context";
import { cn } from "../utilities/cn";

export function PluginRow({ entry, context }: { readonly entry: ScanEntry; readonly context: AppContext }) {
	const { runningKeys, launch } = context;

	const moduleFilename = entry.modulePath.split(/[\\/]/).pop() ?? entry.modulePath;
	const isRunning = runningKeys.has(entry.entryKey);
	const isError = entry.status === "error";
	const isPending = entry.status === "pending";

	const onClick = (): void => {
		if (entry.status !== "ready") return;

		launch(entry);
	};

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={entry.status !== "ready"}
			title={moduleFilename}
			className={cn(
				"group flex w-full items-center gap-3 rounded-md px-3 py-2 text-left outline-none",
				"focus-visible:bg-[#1b1b1f] focus-visible:ring-1 focus-visible:ring-[#4a4a52]",
				entry.status === "ready" ? "cursor-pointer hover:bg-[#1b1b1f]" : "cursor-default",
			)}
		>
			<span className="flex min-w-0 flex-1 flex-col">
				<span className="truncate text-sm text-[#E4E4EA]">{entry.name}</span>
				<span className="truncate text-xs text-[#6a6a72]">{entry.vendorFolder}</span>
			</span>

			{isPending && <Loader2 aria-label="Scanning plugin" className="size-4 shrink-0 animate-spin text-[#6a6a72]" />}

			{isError && (
				<span
					title={entry.error ?? "Failed to load"}
					className="flex shrink-0 items-center gap-1 rounded-sm bg-[#3a1d1d] px-1.5 py-0.5 text-xs text-[#e08a8a]"
				>
					<AlertCircle aria-hidden="true" className="size-3.5" />
					Error
				</span>
			)}

			{isRunning && <span aria-label="Running" title="Running" className="size-2 shrink-0 rounded-full bg-[#5ec27a]" />}
		</button>
	);
}
