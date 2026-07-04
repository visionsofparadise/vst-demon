import fs from "node:fs";
import path from "node:path";
import { parseSettings, serializeSettings, type Settings } from "../shared/settings/Settings";
import type { Logger } from "../shared/models/Logger";

export const defaultScanRoots = (): ReadonlyArray<string> => {
	if (process.platform === "win32") {
		return [
			path.join("C:\\", "Program Files", "Common Files", "VST3"),
			...(process.env.LOCALAPPDATA === undefined ? [] : [path.join(process.env.LOCALAPPDATA, "Programs", "Common", "VST3")]),
		];
	}

	return [];
};

export const readSettings = (settingsPath: string, logger: Logger): Settings => {
	let raw: string;

	try {
		raw = fs.readFileSync(settingsPath, "utf8");
	} catch {
		return { scanRoots: [...defaultScanRoots()] };
	}

	const settings = parseSettings(raw);

	if (settings === undefined) {
		logger.warn("Settings are malformed or do not match the expected schema, using defaults", { namespace: "settings", settingsPath });

		return { scanRoots: [...defaultScanRoots()] };
	}

	return settings;
};

export const writeSettings = (settingsPath: string, settings: Settings): void => {
	fs.writeFileSync(settingsPath, serializeSettings(settings), "utf8");
};

export const ensureSettings = (settingsPath: string, logger: Logger): void => {
	if (fs.existsSync(settingsPath)) return;

	try {
		writeSettings(settingsPath, { scanRoots: [...defaultScanRoots()] });
	} catch (error) {
		logger.warn("Failed to seed settings file", { namespace: "settings", settingsPath, error: String(error) });
	}
};
