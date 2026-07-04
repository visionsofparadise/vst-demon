import { RefreshCw, Settings } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CliEventPayload } from "../main/launchCli";
import { Logger } from "../shared/models/Logger";
import type { ScanEntry } from "../shared/scan/ScanEntry";
import { PluginList } from "./components/PluginList";
import { SearchInput } from "./components/SearchInput";
import { SettingsDialog } from "./components/SettingsDialog";
import { TitleBar } from "./components/TitleBar";
import type { AppContext } from "./models/Context";
import { main } from "./models/Main";
import { MainEvents } from "./models/MainEvents";
import { cn } from "./utilities/cn";

const logger = new Logger("renderer");

export function App() {
	const mainEvents = useMemo(() => new MainEvents(main), []);

	const [entries, setEntries] = useState<ReadonlyArray<ScanEntry>>([]);
	const [scanning, setScanning] = useState(true);
	const [query, setQuery] = useState("");
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [liveSpawns, setLiveSpawns] = useState<ReadonlyMap<string, string>>(new Map());

	const rescan = useCallback((): void => {
		setScanning(true);

		void main
			.startScan()
			.catch((error: unknown) => {
				logger.error("Scan failed", error as Error, { namespace: "renderer" });
			})
			.finally(() => {
				setScanning(false);
			});
	}, []);

	const launch = useCallback((entry: ScanEntry): void => {
		main.launchPlugin(entry).catch((error: unknown) => {
			logger.error("Failed to launch plugin", error as Error, { namespace: "renderer", entryKey: entry.entryKey });
		});
	}, []);

	useEffect(() => {
		rescan();
	}, [rescan]);

	useEffect(() => {
		const onScanUpdate = (next: ReadonlyArray<ScanEntry>): void => {
			setEntries(next);
		};

		mainEvents.on("scan:update", onScanUpdate);

		return () => {
			mainEvents.off("scan:update", onScanUpdate);
		};
	}, [mainEvents]);

	useEffect(() => {
		const onCliEvent = (payload: CliEventPayload): void => {
			if (payload.event.event === "ready") {
				setLiveSpawns((current) => new Map(current).set(payload.spawnId, payload.entryKey));

				return;
			}

			if (payload.event.event === "exited") {
				setLiveSpawns((current) => {
					if (!current.has(payload.spawnId)) return current;

					const next = new Map(current);

					next.delete(payload.spawnId);

					return next;
				});
			}
		};

		mainEvents.on("cli:event", onCliEvent);

		return () => {
			mainEvents.off("cli:event", onCliEvent);
		};
	}, [mainEvents]);

	const runningKeys = useMemo<ReadonlySet<string>>(() => new Set(liveSpawns.values()), [liveSpawns]);

	const context = useMemo<AppContext>(() => ({ main, mainEvents, logger, entries, runningKeys, scanning, query, setQuery, rescan, launch }), [mainEvents, entries, runningKeys, scanning, query, rescan, launch]);

	return (
		<div className="flex h-screen w-screen flex-col bg-[#0D0D0F] text-[#B8B8C0]">
			<TitleBar />
			<div className="flex items-center gap-2 border-b border-[#1b1b1f] px-2 pb-2">
				<SearchInput context={context} />
				<button
					type="button"
					onClick={rescan}
					disabled={scanning}
					aria-label="Rescan plugins"
					title="Rescan plugins"
					className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#B8B8C0] outline-none hover:bg-[#1b1b1f] focus-visible:ring-1 focus-visible:ring-[#4a4a52] disabled:opacity-50"
				>
					<RefreshCw
						aria-hidden="true"
						className={cn("size-4", scanning && "animate-spin")}
					/>
				</button>
				<button
					type="button"
					onClick={() => {
						setSettingsOpen(true);
					}}
					aria-label="Scan folder settings"
					title="Scan folder settings"
					className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#B8B8C0] outline-none hover:bg-[#1b1b1f] focus-visible:ring-1 focus-visible:ring-[#4a4a52]"
				>
					<Settings
						aria-hidden="true"
						className="size-4"
					/>
				</button>
			</div>
			<SettingsDialog
				context={context}
				open={settingsOpen}
				onOpenChange={setSettingsOpen}
			/>
			<div className="flex flex-1 flex-col overflow-hidden">
				<PluginList context={context} />
			</div>
		</div>
	);
}
