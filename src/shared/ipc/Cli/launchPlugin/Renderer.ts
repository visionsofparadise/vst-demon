import type { ScanEntry } from "../../../scan/ScanEntry";
import { AsyncRendererIpc } from "../../../models/AsyncRendererIpc";

export type LaunchPluginIpcParameters = [entry: ScanEntry];
export type LaunchPluginIpcReturn = string;
export const LAUNCH_PLUGIN_ACTION = "launchPlugin" as const;

export class LaunchPluginRendererIpc extends AsyncRendererIpc<typeof LAUNCH_PLUGIN_ACTION, LaunchPluginIpcParameters, LaunchPluginIpcReturn> {
	action = LAUNCH_PLUGIN_ACTION;
}
