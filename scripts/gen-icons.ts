import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const assetsDir = path.resolve(fileURLToPath(import.meta.url), "..", "..", "assets");
const svgPath = path.join(assetsDir, "icon.svg");
const pngPath = path.join(assetsDir, "icon.png");
const icoPath = path.join(assetsDir, "icon.ico");

const ICO_SIZES = [256, 128, 64, 48, 32, 16];

async function main(): Promise<void> {
	const svg = readFileSync(svgPath);

	await sharp(svg, { density: 384 }).resize(1024, 1024).png().toFile(pngPath);

	const pngBuffers = await Promise.all(
		ICO_SIZES.map((size) => sharp(svg, { density: 384 }).resize(size, size).png().toBuffer()),
	);
	const ico = await pngToIco(pngBuffers);
	writeFileSync(icoPath, ico);

	console.log(`Wrote ${pngPath}`);
	console.log(`Wrote ${icoPath} (${ICO_SIZES.join(", ")})`);
}

main().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
