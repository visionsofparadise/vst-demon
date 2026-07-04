import { AsyncMainIpc, type IpcHandlerDependencies } from "../../../models/AsyncMainIpc";
import { LAUNCH_PLUGIN_ACTION, type LaunchPluginIpcParameters, type LaunchPluginIpcReturn } from "./Renderer";

export class LaunchPluginMainIpc extends AsyncMainIpc<LaunchPluginIpcParameters, LaunchPluginIpcReturn> {
	action = LAUNCH_PLUGIN_ACTION;

	handler(...parameters: [...LaunchPluginIpcParameters, IpcHandlerDependencies]): LaunchPluginIpcReturn {
		const [entry, dependencies] = parameters;

		return dependencies.cliManager.launch(entry);
	}
}
