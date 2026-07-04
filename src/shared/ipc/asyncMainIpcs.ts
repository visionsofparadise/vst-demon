import { LaunchPluginMainIpc } from "./Cli/launchPlugin/Main";
import { ReadFileMainIpc } from "./FileSystem/readFile/Main";
import { WriteFileMainIpc } from "./FileSystem/writeFile/Main";
import { StartScanMainIpc } from "./Scan/startScan/Main";
import { ChooseFolderMainIpc } from "./Settings/chooseFolder/Main";

export const ASYNC_MAIN_IPCS = [StartScanMainIpc, LaunchPluginMainIpc, ReadFileMainIpc, WriteFileMainIpc, ChooseFolderMainIpc];
