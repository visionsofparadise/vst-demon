import { app, BrowserWindow } from "electron";
import path from "path";
import { ASYNC_MAIN_IPCS } from "../shared/ipc/asyncMainIpcs";
import type { Logger } from "../shared/models/Logger";
import type { ScanEntry } from "../shared/scan/ScanEntry";
import { CliManager, type CliEventPayload } from "./CliManager";
import { getCliPath } from "./cliPath";
import { ScanService } from "./ScanService";

const VST3_ROOTS: ReadonlyArray<string> = [
	path.join("C:\\", "Program Files", "Common Files", "VST3"),
	...(process.env.LOCALAPPDATA === undefined ? [] : [path.join(process.env.LOCALAPPDATA, "Programs", "Common", "VST3")]),
];

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
		icon: MAIN_WINDOW_VITE_DEV_SERVER_URL ? path.join(__dirname, "../../assets/icon.png") : undefined,
		show: false,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	const windowId = crypto.randomUUID();

	const cliPath = getCliPath();

	const scanService = new ScanService({
		vst3Roots: VST3_ROOTS,
		cachePath: path.join(app.getPath("userData"), "scan-cache.json"),
		cliPath,
		logger,
		onUpdate: (entries: ReadonlyArray<ScanEntry>) => {
			browserWindow.webContents.send("scan:update", entries);
		},
	});

	const cliManager = new CliManager({
		documentsDir: app.getPath("documents"),
		cliPath,
		logger,
		onEvent: (payload: CliEventPayload) => {
			browserWindow.webContents.send("cli:event", payload);
		},
	});

	for (const AsyncMainIpc of ASYNC_MAIN_IPCS) {
		new AsyncMainIpc().register({ browserWindow, logger, windowId, scanService, cliManager });
	}

	browserWindow.on("closed", () => {
		scanService.dispose();
		cliManager.dispose();
	});

	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		browserWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL).catch((error: unknown) => {
			logger.error("Failed to load dev server URL", error as Error, {
				namespace: "window",
				url: MAIN_WINDOW_VITE_DEV_SERVER_URL,
			});
		});
	} else {
		const filePath = path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`);

		browserWindow.loadFile(filePath).catch((error: unknown) => {
			logger.error("Failed to load file", error as Error, { namespace: "window", filePath });
		});
	}

	browserWindow.on("ready-to-show", () => {
		browserWindow.show();
	});

	return browserWindow;
};
