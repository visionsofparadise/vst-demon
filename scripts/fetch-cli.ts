import AdmZip from "adm-zip";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extract } from "tar";

const REPO = "visionsofparadise/vst-demon-cli";
const RELEASE_TAG = "v0.2.2";

interface CliAsset {
	readonly assetName: string;
	readonly sha256: string;
	readonly binaryName: string;
	readonly archiveKind: "zip" | "tar.gz";
}

const CLI_ASSETS: Partial<Record<NodeJS.Platform, CliAsset>> = {
	win32: {
		assetName: "vst-demon-cli-win32-x64.zip",
		sha256: "36c2cc3b95807a8d644e7e4372340339ef027060fc047ad722cd68aef8583d33",
		binaryName: "vst-demon-cli.exe",
		archiveKind: "zip",
	},
	linux: {
		assetName: "vst-demon-cli-linux-x64.tar.gz",
		sha256: "0e5ba5b8b4b21382af9afe4a8b9420937733fbb093e4f82058f8a1857d7eddf9",
		binaryName: "vst-demon-cli",
		archiveKind: "tar.gz",
	},
	darwin: {
		assetName: "vst-demon-cli-darwin-arm64.tar.gz",
		sha256: "0d12a909d04194e5be3769b94e97d008ae9a1e7d414cb834aab37da72391feb0",
		binaryName: "vst-demon-cli",
		archiveKind: "tar.gz",
	},
};

const asset = CLI_ASSETS[process.platform];

if (asset === undefined) {
	console.error(`[fetch-cli] no vst-demon-cli asset for platform ${process.platform} — supported: ${Object.keys(CLI_ASSETS).join(", ")}`);
	process.exit(1);
}

const assetUrl = `https://github.com/${REPO}/releases/download/${RELEASE_TAG}/${asset.assetName}`;

const repoRoot = path.resolve(fileURLToPath(import.meta.url), "..", "..");
const binariesDir = path.join(repoRoot, "binaries");
const binaryPath = path.join(binariesDir, asset.binaryName);

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
	const releaseAsset = release.assets?.find((candidate) => candidate.name === asset.assetName);

	if (releaseAsset === undefined) {
		throw new Error(`Release ${RELEASE_TAG} of ${REPO} has no asset named ${asset.assetName}`);
	}

	return releaseAsset.url;
};

const downloadArchive = async (): Promise<Buffer> => {
	const token = githubToken();
	const directResponse = await fetch(assetUrl, {
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
		const privateAssetUrl = await resolvePrivateAssetUrl(token);
		const assetResponse = await fetch(privateAssetUrl, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/octet-stream",
				"User-Agent": "vst-demon-fetch-cli",
				"X-GitHub-Api-Version": "2022-11-28",
			},
		});

		if (!assetResponse.ok) {
			throw new Error(
				`Download failed for ${privateAssetUrl}: HTTP ${assetResponse.status} ${assetResponse.statusText}`,
			);
		}

		return Buffer.from(await assetResponse.arrayBuffer());
	}

	const hint =
		directResponse.status === 404 && token === undefined
			? " (asset returned 404 and no GITHUB_TOKEN/GH_TOKEN is set — the vst-demon-cli release is private and requires a token)"
			: "";

	throw new Error(
		`Download failed for ${assetUrl}: HTTP ${directResponse.status} ${directResponse.statusText}${hint}`,
	);
};

const extractZip = async (archiveBuffer: Buffer): Promise<void> => {
	const zip = new AdmZip(archiveBuffer);
	const entry = zip.getEntry(asset.binaryName);

	if (entry === null) {
		throw new Error(`Zip ${asset.assetName} has no entry named ${asset.binaryName}`);
	}

	await fs.writeFile(binaryPath, entry.getData());
};

const extractTarGz = async (archiveBuffer: Buffer): Promise<void> => {
	// tar v7 extracts from files/streams, not buffers
	const archivePath = path.join(binariesDir, asset.assetName);

	await fs.writeFile(archivePath, archiveBuffer);

	try {
		await extract({ file: archivePath, cwd: binariesDir });

		if (!(await fileExists(binaryPath))) {
			throw new Error(`Tarball ${asset.assetName} has no entry named ${asset.binaryName}`);
		}

		await fs.chmod(binaryPath, 0o755);
	} finally {
		await fs.rm(archivePath, { force: true });
	}
};

const main = async (): Promise<void> => {
	if (await fileExists(binaryPath)) {
		console.warn(`[fetch-cli] ${asset.binaryName} present, skipping`);

		return;
	}

	await fs.mkdir(binariesDir, { recursive: true });

	console.warn(`[fetch-cli] downloading ${asset.assetName} <- ${assetUrl}`);

	const archiveBuffer = await downloadArchive();
	const actualSha256 = createHash("sha256").update(archiveBuffer).digest("hex");

	if (actualSha256 !== asset.sha256) {
		throw new Error(`sha256 mismatch for ${asset.assetName} — expected ${asset.sha256}, got ${actualSha256}`);
	}

	if (asset.archiveKind === "zip") {
		await extractZip(archiveBuffer);
	} else {
		await extractTarGz(archiveBuffer);
	}

	console.warn(`[fetch-cli] extracted ${asset.binaryName} -> ${binaryPath}`);
};

main().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
