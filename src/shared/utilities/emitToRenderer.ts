import type { CliEventPayload } from "../../main/CliManager";
import type { ScanEntry } from "../scan/ScanEntry";

export interface MainEventMap {
	"scan:update": [entries: ReadonlyArray<ScanEntry>];
	"cli:event": [payload: CliEventPayload];
}

export interface RendererEventMap {}
