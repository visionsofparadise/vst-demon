import { FolderPlus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { parseSettings, serializeSettings, type Settings } from "../../shared/settings/Settings";
import type { AppContext } from "../models/Context";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

export function SettingsDialog({ context, open, onOpenChange }: { readonly context: AppContext; readonly open: boolean; readonly onOpenChange: (open: boolean) => void }) {
	const { main, logger, rescan } = context;

	const [scanRoots, setScanRoots] = useState<ReadonlyArray<string>>([]);

	useEffect(() => {
		if (!open) return;

		main
			.readFile("settings.json")
			.then((raw) => {
				setScanRoots(raw === undefined ? [] : (parseSettings(raw)?.scanRoots ?? []));
			})
			.catch((error: unknown) => {
				logger.error("Failed to load settings", error as Error, { namespace: "renderer" });
			});
	}, [open, main, logger]);

	const persist = useCallback(
		(next: ReadonlyArray<string>): void => {
			const settings: Settings = { scanRoots: [...next] };

			main
				.writeFile("settings.json", serializeSettings(settings))
				.then(() => {
					setScanRoots(next);
					rescan();
				})
				.catch((error: unknown) => {
					logger.error("Failed to save settings", error as Error, { namespace: "renderer" });
				});
		},
		[main, logger, rescan],
	);

	const addFolder = useCallback((): void => {
		main
			.chooseFolder()
			.then((folder) => {
				if (folder === undefined || scanRoots.includes(folder)) return;

				persist([...scanRoots, folder]);
			})
			.catch((error: unknown) => {
				logger.error("Failed to choose folder", error as Error, { namespace: "renderer" });
			});
	}, [main, logger, scanRoots, persist]);

	const removeFolder = useCallback(
		(folder: string): void => {
			persist(scanRoots.filter((root) => root !== folder));
		},
		[scanRoots, persist],
	);

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>Scan folders</DialogTitle>
					<DialogDescription>VST Demon scans these folders for installed VST3 plugins.</DialogDescription>
				</DialogHeader>
				<ul className="flex flex-col gap-1">
					{scanRoots.length === 0 ? (
						<li className="rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">No folders configured. Nothing will be scanned.</li>
					) : (
						scanRoots.map((root) => (
							<li
								key={root}
								className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2"
							>
								<span
									className="min-w-0 flex-1 truncate text-sm text-foreground"
									title={root}
								>
									{root}
								</span>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => {
										removeFolder(root);
									}}
									aria-label={`Remove ${root}`}
									title="Remove folder"
								>
									<X aria-hidden="true" />
								</Button>
							</li>
						))
					)}
				</ul>
				<Button
					variant="outline"
					onClick={addFolder}
				>
					<FolderPlus aria-hidden="true" />
					Add Folder
				</Button>
			</DialogContent>
		</Dialog>
	);
}
