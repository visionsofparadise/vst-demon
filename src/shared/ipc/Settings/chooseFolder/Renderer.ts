import { AsyncRendererIpc } from "../../../models/AsyncRendererIpc";

export type ChooseFolderIpcParameters = [];
export type ChooseFolderIpcReturn = string | undefined;
export const CHOOSE_FOLDER_ACTION = "chooseFolder" as const;

export class ChooseFolderRendererIpc extends AsyncRendererIpc<typeof CHOOSE_FOLDER_ACTION, ChooseFolderIpcParameters, ChooseFolderIpcReturn> {
	action = CHOOSE_FOLDER_ACTION;
}
