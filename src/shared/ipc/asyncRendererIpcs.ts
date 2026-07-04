import type { IpcHandlerAction, IpcHandlerParameters, IpcHandlerReturn } from "../models/AsyncRendererIpc";
import { LaunchPluginRendererIpc } from "./Cli/launchPlugin/Renderer";
import { ReadFileRendererIpc } from "./FileSystem/readFile/Renderer";
import { WriteFileRendererIpc } from "./FileSystem/writeFile/Renderer";
import { StartScanRendererIpc } from "./Scan/startScan/Renderer";
import { ChooseFolderRendererIpc } from "./Settings/chooseFolder/Renderer";

export const ASYNC_RENDERER_IPCS = [StartScanRendererIpc, LaunchPluginRendererIpc, ReadFileRendererIpc, WriteFileRendererIpc, ChooseFolderRendererIpc];

export type AsyncIpcAction = IpcHandlerAction<InstanceType<(typeof ASYNC_RENDERER_IPCS)[number]>>;
export type AsyncIpcParameters<A extends AsyncIpcAction> = IpcHandlerParameters<Extract<InstanceType<(typeof ASYNC_RENDERER_IPCS)[number]>, { action: A }>>;
export type AsyncIpcReturn<A extends AsyncIpcAction> = IpcHandlerReturn<Extract<InstanceType<(typeof ASYNC_RENDERER_IPCS)[number]>, { action: A }>>;
