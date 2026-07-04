<p align="center">
  <img src="assets/vst-demon-logo-spin.webp" width="400" alt="VST Demon logomark spinning" />
</p>

# VST Demon

VST Demon is a `.vstpreset` editor that uses the plugin's own GUI. It opens any installed VST3 in a bare host window and continuously saves the plugin's state to a `.vstpreset` file as you edit — no DAW required.

It scans your system's VST3 folders and lists every plugin it finds; click one to start editing. Hosting is done by the bundled [vst-demon-cli](https://github.com/visionsofparadise/vst-demon-cli), which is also usable standalone.

## Installation

Download `VST Demon-<version> Setup.exe` from the [releases](https://github.com/visionsofparadise/vst-demon/releases) and run it.

## Usage

Launch VST Demon; it scans your VST3 folders and shows the plugin list. Type to filter by name. Click a plugin to open its editor; a dot marks it as running until you close its window. Use the rescan button to pick up newly installed plugins.

Presets are written to `Documents\VST Demon\`, one file per plugin (shell sub-plugins use the sub-plugin name). To control where a preset writes, use the plugin window's **File** menu: **Open Preset…** loads a file and re-points continuous saving at it; **Save Preset As…** writes to a new path and continues saving there.

### Known Limitations

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
