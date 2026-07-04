import { app } from "electron";
import path from "node:path";

const CLI_BINARY_NAME = process.platform === "win32" ? "vst-demon-cli.exe" : "vst-demon-cli";

export const getCliPath = (): string =>
	app.isPackaged
		? path.join(process.resourcesPath, "binaries", CLI_BINARY_NAME)
		: path.resolve(app.getAppPath(), "binaries", CLI_BINARY_NAME);
