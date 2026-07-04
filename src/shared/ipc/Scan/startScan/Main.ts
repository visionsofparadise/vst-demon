import { AsyncMainIpc, type IpcHandlerDependencies } from "../../../models/AsyncMainIpc";
import { START_SCAN_ACTION, type StartScanIpcParameters, type StartScanIpcReturn } from "./Renderer";

export class StartScanMainIpc extends AsyncMainIpc<StartScanIpcParameters, StartScanIpcReturn> {
	action = START_SCAN_ACTION;

	async handler(dependencies: IpcHandlerDependencies): Promise<StartScanIpcReturn> {
		return dependencies.scanService.scan();
	}
}
