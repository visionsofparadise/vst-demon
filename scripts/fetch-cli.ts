import AdmZip from "adm-zip";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CLI_URL =
	"https://github.com/visionsofparadise/vst-demon-cli/releases/download/v0.2.2/vst-demon-cli-win32-x64.zip";
const CLI_SHA256 = "36c2cc3b95807a8d644e7e4372340339ef027060fc047ad722cd68aef8583d33";
const CLI_ENTRY = "vst-demon-cli.exe";

const REPO = "visionsofparadise/vst-demon-cli";
const RELEASE_TAG = "v0.2.2";
const ASSET_NAME = "vst-demon-cli-win32-x64.zip";

const repoRoot = path.resolve(fileURLToPath(import.meta.url), "..", "..");
const binariesDir = path.join(repoRoot, "binaries");
const exePath = path.join(binariesDir, CLI_ENTRY);

const githubToken = (): string | undefined =>
	process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? undefined;

const fileExists = async (target: string): Promise<boolean> => {
	try {
		await fs.stat(target);

		return true;
	} catch {
		return false;
	}
};

const resolvePrivateAssetUrl = async (token: string): Promise<string> => {
	const releaseUrl = `https://api.github.com/repos/${REPO}/releases/tags/${RELEASE_TAG}`;
	const response = await fetch(releaseUrl, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/vnd.github+json",
			"User-Agent": "vst-demon-fetch-cli",
			"X-GitHub-Api-Version": "2022-11-28",
		},
	});

	if (!response.ok) {
		throw new Error(
			`Failed to resolve release ${RELEASE_TAG} from ${REPO}: HTTP ${response.status} ${response.statusText}`,
		);
	}

	const release = (await response.json()) as { assets?: ReadonlyArray<{ name: string; url: string }> };
	const asset = release.assets?.find((candidate) => candidate.name === ASSET_NAME);

	if (asset === undefined) {
		throw new Error(`Release ${RELEASE_TAG} of ${REPO} has no asset named ${ASSET_NAME}`);
	}

	return asset.url;
};

const downloadZip = async (): Promise<Buffer> => {
	const token = githubToken();
	const directResponse = await fetch(CLI_URL, {
		headers: {
			Accept: "application/octet-stream",
			"User-Agent": "vst-demon-fetch-cli",
			...(token === undefined ? {} : { Authorization: `Bearer ${token}` }),
		},
	});

	if (directResponse.ok) {
		return Buffer.from(await directResponse.arrayBuffer());
	}

	if (directResponse.status === 404 && token !== undefined) {
		const assetUrl = await resolvePrivateAssetUrl(token);
		const assetResponse = await fetch(assetUrl, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/octet-stream",
				"User-Agent": "vst-demon-fetch-cli",
				"X-GitHub-Api-Version": "2022-11-28",
			},
		});

		if (!assetResponse.ok) {
			throw new Error(
				`Download failed for ${assetUrl}: HTTP ${assetResponse.status} ${assetResponse.statusText}`,
			);
		}

		return Buffer.from(await assetResponse.arrayBuffer());
	}

	const hint =
		directResponse.status === 404 && token === undefined
			? " (asset returned 404 and no GITHUB_TOKEN/GH_TOKEN is set — the vst-demon-cli release is private and requires a token)"
			: "";

	throw new Error(
		`Download failed for ${CLI_URL}: HTTP ${directResponse.status} ${directResponse.statusText}${hint}`,
	);
};

const main = async (): Promise<void> => {
	if (await fileExists(exePath)) {
		console.warn(`[fetch-cli] ${CLI_ENTRY} present, skipping`);

		return;
	}

	await fs.mkdir(binariesDir, { recursive: true });

	console.warn(`[fetch-cli] downloading ${ASSET_NAME} <- ${CLI_URL}`);

	const zipBuffer = await downloadZip();
	const actualSha256 = createHash("sha256").update(zipBuffer).digest("hex");

	if (actualSha256 !== CLI_SHA256) {
		throw new Error(`sha256 mismatch for ${ASSET_NAME} — expected ${CLI_SHA256}, got ${actualSha256}`);
	}

	const zip = new AdmZip(zipBuffer);
	const entry = zip.getEntry(CLI_ENTRY);

	if (entry === null) {
		throw new Error(`Zip ${ASSET_NAME} has no entry named ${CLI_ENTRY}`);
	}

	await fs.writeFile(exePath, entry.getData());

	console.warn(`[fetch-cli] extracted ${CLI_ENTRY} -> ${exePath}`);
};

main().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
