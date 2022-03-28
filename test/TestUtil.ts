import * as fs from "fs-extra";
import {InsightError} from "../src/controller/IInsightFacade";

const persistDir = "./data";

function getContentFromArchives(name: string): Promise<string> {
	return new Promise((resolve, reject) => {
		try {
			return fs.readFileSync("test/resources/archives/" + name).toString("base64");
		} catch (err) {
			throw new InsightError("invalid zip");
		}
	});
}

function getContentFromArchivesAwait(name: string): string {
	return fs.readFileSync("test/resources/archives/" + name).toString("base64");
}

function serverGetContentFromArchives(name: string): Buffer {
	return fs.readFileSync("test/resources/archives/" + name);
}

function clearDisk(): void {
	fs.removeSync(persistDir);
}

export {getContentFromArchives, getContentFromArchivesAwait, persistDir, clearDisk, serverGetContentFromArchives};
