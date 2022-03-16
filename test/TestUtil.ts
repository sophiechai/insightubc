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

function clearDisk(): void {
	fs.removeSync(persistDir);
}

export {getContentFromArchives, persistDir, clearDisk};
