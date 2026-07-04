# VST Demon

A launcher for [vst-demon-cli](https://github.com/visionsofparadise/vst-demon-cli). It scans your system's VST3 folders, lists every installed plugin, and opens any one with a click — the plugin's own GUI appears in a bare host window and its state is continuously saved to a `.vstpreset` file as you edit. No DAW, no command line.

Authoring `.vstpreset` files otherwise requires a DAW or Steinberg's VST3PluginTestHost. VST Demon needs neither: click a plugin, turn knobs, close the window — the preset is saved.

Windows only.

## What it does

- Scans `C:\Program Files\Common Files\VST3\` and `%LOCALAPPDATA%\Programs\Common\VST3\`, listing every `.vst3` plugin. Shell plugins (e.g. Waves WaveShell) expand to one entry per sub-plugin.
- Click a plugin to open its editor. Each plugin auto-saves to `Documents\VST Demon\<plugin name>.vstpreset` — tweaks always persist, and reopening a plugin restores its last state.
- The bundled CLI does all the hosting and file writing; the app is a thin launcher over it.

## Installation

Download `VST Demon-<version> Setup.exe` from the [releases](https://github.com/visionsofparadise/vst-demon/releases) and run it. The app installs per-user (no administrator rights) and launches itself when done. Updates and uninstall are handled through Windows.

The installer is unsigned, so Windows SmartScreen shows a **"Windows protected your PC"** prompt on first run. To proceed: click **More info**, then **Run anyway**. (You can also right-click the downloaded file → **Properties** → check **Unblock** → **OK** before running.)

## Usage

Launch VST Demon; it scans your VST3 folders and shows the plugin list (filenames appear immediately, then shell plugins expand as they're probed — Waves and iZotope modules take a moment). Type to filter by name. Click a plugin to open its editor; a dot marks it as running until you close its window. Use the rescan button to pick up newly installed plugins.

Presets are written to `Documents\VST Demon\`, one file per plugin (shell sub-plugins use the sub-plugin name). Open that `.vstpreset` in any VST3 host — including buffered-audio-graph's render pipeline — to reuse the state.

### Plugin state that doesn't persist

A plugin that can't list (e.g. a Waves shell with an inactive license) or fails to load shows an error with the underlying message. Waves shell plugins list and open, but their state does **not** round-trip to a portable `.vstpreset` — this is a Waves limitation, documented in the [CLI README](https://github.com/visionsofparadise/vst-demon-cli#readme). Author Waves presets in a Waves-aware host.

## Development

```
npm install
npm run fetch-cli   # download the pinned vst-demon-cli binary into binaries/
npm run start       # run the app in dev
npm run check       # eslint + tsc
npm run unit        # vitest
npm run make        # build the Windows installer into out/make/
```

`fetch-cli` downloads the pinned CLI release into `binaries/` (gitignored) and is run automatically before `make` in CI. The built app bundles that binary as a sidecar (`resources/binaries/vst-demon.exe`).
