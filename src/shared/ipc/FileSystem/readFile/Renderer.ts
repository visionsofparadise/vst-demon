import { AsyncRendererIpc } from "../../../models/AsyncRendererIpc";

export type ReadFileIpcParameters = [name: string];
export type ReadFileIpcReturn = string | undefined;
export const READ_FILE_ACTION = "readFile" as const;

export class ReadFileRendererIpc extends AsyncRendererIpc<typeof READ_FILE_ACTION, ReadFileIpcParameters, ReadFileIpcReturn> {
	action = READ_FILE_ACTION;
}
