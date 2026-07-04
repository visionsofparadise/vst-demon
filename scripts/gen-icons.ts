import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";
import { BICUBIC2, createICNS } from "png2icons";

const assetsDir = path.resolve(fileURLToPath(import.meta.url), "..", "..", "assets");
const svgPath = path.join(assetsDir, "icon.svg");
const pngPath = path.join(assetsDir, "icon.png");
const icoPath = path.join(assetsDir, "icon.ico");
const icnsPath = path.join(assetsDir, "icon.icns");

const ICO_SIZES = [256, 128, 64, 48, 32, 16];

async function main(): Promise<void> {
	const svg = readFileSync(svgPath);

	const png1024 = await sharp(svg, { density: 384 }).resize(1024, 1024).png().toBuffer();
	writeFileSync(pngPath, png1024);

	const pngBuffers = await Promise.all(
		ICO_SIZES.map((size) => sharp(svg, { density: 384 }).resize(size, size).png().toBuffer()),
	);
	const ico = await pngToIco(pngBuffers);
	writeFileSync(icoPath, ico);

	const icns = createICNS(png1024, BICUBIC2, 0);

	if (icns === null) {
		throw new Error("png2icons.createICNS returned null");
	}

	writeFileSync(icnsPath, icns);

	console.log(`Wrote ${pngPath}`);
	console.log(`Wrote ${icoPath} (${ICO_SIZES.join(", ")})`);
	console.log(`Wrote ${icnsPath}`);
}

main().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
