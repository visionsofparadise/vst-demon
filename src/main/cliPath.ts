import { app } from "electron";
import path from "node:path";

export const getCliPath = (): string =>
	app.isPackaged
		? path.join(process.resourcesPath, "binaries", "vst-demon-cli.exe")
		: path.resolve(app.getAppPath(), "binaries", "vst-demon-cli.exe");
