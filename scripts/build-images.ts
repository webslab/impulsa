import { $, ProcessOutput } from "npm:zx";
import "jsr:@std/dotenv/load";

import deno_file from "../deno.json" with { type: "json" };

const PLATFORMS = ["linux/arm64", "linux/amd64"];
const IMAGE_NAME = deno_file.name;
const VERSION = deno_file.version;
const OWNER = Deno.env.get("DB_NS") || "webslab";

const USERNAME = Deno.env.get("DOCKER_USERNAME") || Deno.env.get("DB_NS");
const PASSWORD = Deno.env.get("DOCKER_TOKEN");

const platforms = PLATFORMS.join(",");
const repo = `${OWNER}/${IMAGE_NAME}`;

async function main() {
	console.log(`Building docker images for ${IMAGE_NAME} - v${VERSION}...\n`);

	if (!Deno.env.get("DB_URL")) throw new Error("DB_URL is not set");
	if (!Deno.env.get("DB_NS")) throw new Error("DB_NS is not set");
	if (!USERNAME) throw new Error("DOCKER_USERNAME is not set");
	if (!PASSWORD) throw new Error("DOCKER_TOKEN is not set");

	if (!await buildDist()) throw new Error("Failed to build dist");

	await createManifests();
	await buildImages();
	await loginDocker();
	await pushImages();
}

function pushImages(): Promise<ProcessOutput[]> {
	const version = `${repo}:v${VERSION}`;
	const latest = `${repo}:latest`;

	console.log("Pushing images...\n");

	return Promise.all([
		$`podman manifest push --all ${version} docker://docker.io/${version}`,
		$`podman manifest push --all ${latest} docker://docker.io/${latest}`,
	]);
}

function loginDocker(): Promise<ProcessOutput> {
	return $`podman login -u ${USERNAME} -p ${PASSWORD}`;
}

function buildImages(): Promise<ProcessOutput[]> {
	const version = `${repo}:v${VERSION}`;
	const latest = `${repo}:latest`;

	console.log("Building images...\n");

	return Promise.all([
		$`podman build --manifest ${version} --platform ${platforms} .`,
		$`podman build --manifest ${latest} --platform ${platforms} .`,
	]);
}

async function removeImages(): Promise<void> {
	type Image = { Names: string[] };

	const version = `${repo}:v${VERSION}`;
	const latest = `${repo}:latest`;

	const list = await $`podman image list --format json`.json() as Image[];

	console.log("Removing images...");

	const foo = list.filter((image: Image) =>
		image.Names.includes("localhost/" + latest) ||
		image.Names.includes("localhost/" + version)
	);

	if (foo.length === 0) {
		console.log("No images to remove");
		return;
	}

	foo.forEach(async (image: Image) => {
		const name = image.Names[0];
		await $`podman rmi ${name}`;
	});
}

async function createManifests(): Promise<boolean> {
	const version = `${repo}:v${VERSION}`;
	const latest = `${repo}:latest`;

	return (await $`podman manifest create ${version}`).exitCode === 0 &&
		(await $`podman manifest create ${latest}`).exitCode === 0;
}

async function buildDist(): Promise<boolean> {
	return (await $`deno task build`).exitCode === 0;
}

// -----

try {
	await main();
} catch (error) {
	console.error(error);
} finally {
	await $`podman logout`;
	await $`podman system prune -f`;

	await removeImages();

	console.log("\nScript finish successfully!\n");
}
