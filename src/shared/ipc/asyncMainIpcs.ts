import { LaunchPluginMainIpc } from "./Cli/launchPlugin/Main";
import { StartScanMainIpc } from "./Scan/startScan/Main";

export const ASYNC_MAIN_IPCS = [StartScanMainIpc, LaunchPluginMainIpc];
