import { AsyncRendererIpc } from "../../../models/AsyncRendererIpc";

export type WriteFileIpcParameters = [name: string, contents: string];
export type WriteFileIpcReturn = undefined;
export const WRITE_FILE_ACTION = "writeFile" as const;

export class WriteFileRendererIpc extends AsyncRendererIpc<typeof WRITE_FILE_ACTION, WriteFileIpcParameters, WriteFileIpcReturn> {
	action = WRITE_FILE_ACTION;
}
