import type { Logger } from "../../shared/models/Logger";
import type { ScanEntry } from "../../shared/scan/ScanEntry";
import type { Main } from "./Main";

export interface AppContext {
	readonly main: Main;
	readonly logger: Logger;
	readonly entries: ReadonlyArray<ScanEntry>;
	readonly runningKeys: ReadonlySet<string>;
	readonly scanning: boolean;
	readonly query: string;
	readonly setQuery: (query: string) => void;
	readonly rescan: () => void;
	readonly launch: (entry: ScanEntry) => void;
}
