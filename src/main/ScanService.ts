import type { Logger } from "../shared/models/Logger";
import type { ScanEntry } from "../shared/scan/ScanEntry";
import { isCacheHit, readCache, statModule, writeCache, type CacheRecord, type ScanCache } from "./scan/cache";
import { deriveErrorEntry, derivePendingEntry, deriveReadyEntries } from "./scan/entries";
import { listModule } from "./scan/listing";
import { walkVst3Roots, type WalkModule } from "./scan/walk";

const LIST_POOL_CONCURRENCY = 3;

export interface ScanServiceOptions {
	readonly vst3Roots: ReadonlyArray<string>;
	readonly cachePath: string;
	readonly cliPath: string;
	readonly logger: Logger;
	readonly onUpdate: (entries: ReadonlyArray<ScanEntry>) => void;
}

const recordToEntries = (module: WalkModule, record: CacheRecord): ReadonlyArray<ScanEntry> =>
	"classNames" in record ? deriveReadyEntries(module, record.classNames) : [deriveErrorEntry(module, record.error)];

export class ScanService {
	private readonly options: ScanServiceOptions;
	private inFlight: Promise<ReadonlyArray<ScanEntry>> | undefined;

	constructor(options: ScanServiceOptions) {
		this.options = options;
	}

	async scan(): Promise<ReadonlyArray<ScanEntry>> {
		if (this.inFlight !== undefined) return this.inFlight;

		this.inFlight = this.runScan().finally(() => {
			this.inFlight = undefined;
		});

		return this.inFlight;
	}

	dispose(): void {
		this.inFlight = undefined;
	}

	private async runScan(): Promise<ReadonlyArray<ScanEntry>> {
		const { logger, cachePath, cliPath, onUpdate } = this.options;
		const modules = walkVst3Roots(this.options.vst3Roots, logger);
		const cache = readCache(cachePath, logger);

		const entriesByModule = new Map<string, ReadonlyArray<ScanEntry>>();
		const toProbe: Array<WalkModule> = [];

		for (const module of modules) {
			const record = cache[module.modulePath];
			const stat = this.statModuleSafe(module);
			const cached = stat !== undefined && isCacheHit(record, stat) ? record : undefined;

			if (cached !== undefined) {
				entriesByModule.set(module.modulePath, recordToEntries(module, cached));
			} else {
				entriesByModule.set(module.modulePath, [derivePendingEntry(module)]);
				toProbe.push(module);
			}
		}

		const emit = (): void => {
			onUpdate(this.flatten(modules, entriesByModule));
		};

		emit();

		const nextCache: ScanCache = { ...cache };

		await this.runPool(toProbe, async (module) => {
			const stat = this.statModuleSafe(module);
			const result = await listModule(cliPath, module.modulePath);

			if (result.ok) {
				entriesByModule.set(module.modulePath, deriveReadyEntries(module, result.classNames));

				if (stat !== undefined) nextCache[module.modulePath] = { ...stat, classNames: [...result.classNames] };
			} else {
				entriesByModule.set(module.modulePath, [deriveErrorEntry(module, result.error)]);

				if (stat !== undefined) nextCache[module.modulePath] = { ...stat, error: result.error };
			}

			emit();
		});

		this.writeCacheSafe(nextCache);

		return this.flatten(modules, entriesByModule);
	}

	private flatten(modules: ReadonlyArray<WalkModule>, entriesByModule: Map<string, ReadonlyArray<ScanEntry>>): ReadonlyArray<ScanEntry> {
		const entries: Array<ScanEntry> = [];

		for (const module of modules) {
			const moduleEntries = entriesByModule.get(module.modulePath) ?? [derivePendingEntry(module)];

			entries.push(...moduleEntries);
		}

		return entries;
	}

	private async runPool(modules: ReadonlyArray<WalkModule>, worker: (module: WalkModule) => Promise<void>): Promise<void> {
		let cursor = 0;

		const runNext = async (): Promise<void> => {
			while (cursor < modules.length) {
				const module = modules[cursor];

				cursor += 1;

				if (module === undefined) continue;

				await worker(module);
			}
		};

		const workerCount = Math.min(LIST_POOL_CONCURRENCY, modules.length);

		await Promise.all(Array.from({ length: workerCount }, () => runNext()));
	}

	private statModuleSafe(module: WalkModule): { size: number; mtimeMs: number } | undefined {
		try {
			return statModule(module.modulePath);
		} catch (error) {
			this.options.logger.warn("Failed to stat module", { namespace: "scan", modulePath: module.modulePath, error: String(error) });

			return undefined;
		}
	}

	private writeCacheSafe(cache: ScanCache): void {
		try {
			writeCache(this.options.cachePath, cache);
		} catch (error) {
			this.options.logger.warn("Failed to write scan cache", { namespace: "scan", cachePath: this.options.cachePath, error: String(error) });
		}
	}
}
