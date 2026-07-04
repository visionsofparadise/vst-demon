import type { AsyncMainIpc } from "../models/AsyncMainIpc";

export const ASYNC_MAIN_IPCS: ReadonlyArray<new () => AsyncMainIpc<Array<unknown>, unknown>> = [];
