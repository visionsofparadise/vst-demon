import { dialog } from "electron";
import { AsyncMainIpc, type IpcHandlerDependencies } from "../../../models/AsyncMainIpc";
import { CHOOSE_FOLDER_ACTION, type ChooseFolderIpcParameters, type ChooseFolderIpcReturn } from "./Renderer";

export class ChooseFolderMainIpc extends AsyncMainIpc<ChooseFolderIpcParameters, ChooseFolderIpcReturn> {
	action = CHOOSE_FOLDER_ACTION;

	async handler(dependencies: IpcHandlerDependencies): Promise<ChooseFolderIpcReturn> {
		const result = await dialog.showOpenDialog(dependencies.browserWindow, { properties: ["openDirectory"] });

		return result.filePaths[0];
	}
}
