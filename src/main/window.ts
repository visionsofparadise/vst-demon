import { BrowserWindow } from "electron";
import path from "path";
import { ASYNC_MAIN_IPCS } from "../shared/ipc/asyncMainIpcs";
import type { Logger } from "../shared/models/Logger";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

const WINDOW_CONFIG = {
	width: 1200,
	height: 800,
	minWidth: 600,
	minHeight: 400,
	titleBarStyle: "hidden" as const,
	titleBarOverlay: {
		color: "#0D0D0F",
		symbolColor: "#B8B8C0",
		height: 44,
	},
};

export const createWindow = (logger: Logger): BrowserWindow => {
	const browserWindow = new BrowserWindow({
		...WINDOW_CONFIG,
		icon: path.join(__dirname, "../../assets/icon.png"),
		show: false,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	const windowId = crypto.randomUUID();

	for (const AsyncMainIpc of ASYNC_MAIN_IPCS) {
		new AsyncMainIpc().register({ browserWindow, logger, windowId });
	}

	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		browserWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL).catch((error: unknown) => {
			logger.error("Failed to load dev server URL", error as Error, {
				namespace: "window",
				url: MAIN_WINDOW_VITE_DEV_SERVER_URL,
			});
		});
	} else {
		const filePath = path.join(__dirname, `../../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`);

		browserWindow.loadFile(filePath).catch((error: unknown) => {
			logger.error("Failed to load file", error as Error, { namespace: "window", filePath });
		});
	}

	browserWindow.on("ready-to-show", () => {
		browserWindow.show();
	});

	return browserWindow;
};
