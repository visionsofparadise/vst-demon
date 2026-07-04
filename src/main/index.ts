import { app, BrowserWindow } from "electron";
import squirrelStartup from "electron-squirrel-startup";
import { logger } from "./logger";
import { createWindow } from "./window";

// Static import (not `require`) so Vite bundles the module into main.js — the
// packaged asar ships no node_modules, so a runtime require of it is unresolvable.
if (squirrelStartup) {
	app.quit();
}

app.whenReady()
	.then(() => createWindow(logger))
	.catch(console.error);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow(logger);
	}
});
