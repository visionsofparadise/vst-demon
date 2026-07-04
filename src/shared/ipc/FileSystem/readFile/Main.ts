import fs from "node:fs";
import path from "node:path";
import { AsyncMainIpc, type IpcHandlerDependencies } from "../../../models/AsyncMainIpc";
import { ALLOWED_FILES } from "../allowedFiles";
import { READ_FILE_ACTION, type ReadFileIpcParameters, type ReadFileIpcReturn } from "./Renderer";

export class ReadFileMainIpc extends AsyncMainIpc<ReadFileIpcParameters, ReadFileIpcReturn> {
	action = READ_FILE_ACTION;

	handler(name: string, dependencies: IpcHandlerDependencies): ReadFileIpcReturn {
		if (!ALLOWED_FILES.has(name)) throw new Error(`File "${name}" is not allowed`);

		try {
			return fs.readFileSync(path.join(dependencies.userDataDir, name), "utf8");
		} catch {
			return undefined;
		}
	}
}
