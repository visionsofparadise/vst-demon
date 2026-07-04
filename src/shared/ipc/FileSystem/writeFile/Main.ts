import fs from "node:fs";
import path from "node:path";
import { AsyncMainIpc, type IpcHandlerDependencies } from "../../../models/AsyncMainIpc";
import { ALLOWED_FILES } from "../allowedFiles";
import { WRITE_FILE_ACTION, type WriteFileIpcParameters, type WriteFileIpcReturn } from "./Renderer";

export class WriteFileMainIpc extends AsyncMainIpc<WriteFileIpcParameters, WriteFileIpcReturn> {
	action = WRITE_FILE_ACTION;

	handler(...parameters: [...WriteFileIpcParameters, IpcHandlerDependencies]): WriteFileIpcReturn {
		const [name, contents, dependencies] = parameters;

		if (!ALLOWED_FILES.has(name)) throw new Error(`File "${name}" is not allowed`);

		fs.writeFileSync(path.join(dependencies.userDataDir, name), contents, "utf8");

		return undefined;
	}
}
