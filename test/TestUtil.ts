import * as fs from "fs-extra";
import {InsightError} from "../src/controller/IInsightFacade";

const persistDir = "./data";

function getContentFromArchives(name: string): string {
	let output;
	// try {
	output = fs.readFileSync("test/resources/archives/" + name).toString("base64");
	// } catch (err) {
	// 	// return new InsightError("readFileSync error");
	// }
	return output;
}

function clearDisk(): void {
	fs.removeSync(persistDir);
}

export {getContentFromArchives, persistDir, clearDisk};
