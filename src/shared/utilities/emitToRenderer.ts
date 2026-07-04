import type { ScanEntry } from "../scan/ScanEntry";

export interface MainEventMap {
	"scan:update": [entries: ReadonlyArray<ScanEntry>];
}

export interface RendererEventMap {}
