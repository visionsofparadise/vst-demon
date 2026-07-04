import type { ScanEntry } from "../../../scan/ScanEntry";
import { AsyncRendererIpc } from "../../../models/AsyncRendererIpc";

export type StartScanIpcParameters = [];
export type StartScanIpcReturn = ReadonlyArray<ScanEntry>;
export const START_SCAN_ACTION = "startScan" as const;

export class StartScanRendererIpc extends AsyncRendererIpc<typeof START_SCAN_ACTION, StartScanIpcParameters, StartScanIpcReturn> {
	action = START_SCAN_ACTION;
}
