import type { IpcRendererEvent } from "electron";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CliEventPayload } from "../main/CliManager";
import { Logger } from "../shared/models/Logger";
import type { ScanEntry } from "../shared/scan/ScanEntry";
import { PluginList } from "./components/PluginList";
import { TitleBar } from "./components/TitleBar";
import { SearchInput } from "./components/SearchInput";
import type { AppContext } from "./models/Context";
import { main } from "./models/Main";

const logger = new Logger("renderer");

export function App() {
	const [entries, setEntries] = useState<ReadonlyArray<ScanEntry>>([]);
	const [scanning, setScanning] = useState(true);
	const [query, setQuery] = useState("");
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
		const onScanUpdate = (_event: IpcRendererEvent, next: ReadonlyArray<ScanEntry>): void => {
			setEntries(next);
		};

		main.events.on("scan:update", onScanUpdate);

		return () => {
			main.events.removeListener("scan:update", onScanUpdate);
		};
	}, []);

	useEffect(() => {
		const onCliEvent = (_event: IpcRendererEvent, payload: CliEventPayload): void => {
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

		main.events.on("cli:event", onCliEvent);

		return () => {
			main.events.removeListener("cli:event", onCliEvent);
		};
	}, []);

	const runningKeys = useMemo<ReadonlySet<string>>(() => new Set(liveSpawns.values()), [liveSpawns]);

	const context = useMemo<AppContext>(
		() => ({ main, logger, entries, runningKeys, scanning, query, setQuery, rescan, launch }),
		[entries, runningKeys, scanning, query, rescan, launch],
	);

	return (
		<div className="flex h-screen w-screen flex-col bg-[#0D0D0F] text-[#B8B8C0]">
			<TitleBar context={context} />
			<div className="flex items-center gap-2 border-b border-[#1b1b1f] px-2 pb-2">
				<SearchInput context={context} />
			</div>
			<div className="flex flex-1 flex-col overflow-hidden">
				<PluginList context={context} />
			</div>
		</div>
	);
}
