import fs from "node:fs";
import type { Logger } from "../../shared/models/Logger";

const DEBOUNCE_MS = 1500;

export const createRootWatchers = (roots: ReadonlyArray<string>, onChange: () => void, logger: Logger): (() => void) => {
	const watchers: Array<fs.FSWatcher> = [];

	let timer: NodeJS.Timeout | undefined;

	const schedule = (): void => {
		if (timer !== undefined) clearTimeout(timer);

		timer = setTimeout(() => {
			timer = undefined;

			onChange();
		}, DEBOUNCE_MS);
	};

	for (const root of roots) {
		if (!fs.existsSync(root)) continue;

		let watcher: fs.FSWatcher;

		try {
			watcher = fs.watch(root, { recursive: true });
		} catch (error) {
			logger.warn("Failed to watch scan root", { namespace: "scan", root, error: String(error) });

			continue;
		}

		watcher.on("change", schedule);

		watcher.on("error", (error: unknown) => {
			logger.warn("Scan root watcher error, dropping watcher", { namespace: "scan", root, error: String(error) });

			watcher.close();
		});

		watchers.push(watcher);
	}

	return (): void => {
		if (timer !== undefined) {
			clearTimeout(timer);

			timer = undefined;
		}

		for (const watcher of watchers) watcher.close();

		watchers.length = 0;
	};
};
