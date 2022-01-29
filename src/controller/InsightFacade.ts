import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
} from "./IInsightFacade";

import JSZip from "jszip";
import fse from "fs-extra";

import {} from "./DatasetVerifier";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
let jsZip: JSZip;

export default class InsightFacade implements IInsightFacade {

	constructor() {
		jsZip = new JSZip();

		console.log("InsightFacadeImpl::init()");
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// content - fs.readFileSync("test/resources/archives/courses.zip").toString("base64")

		if (kind === InsightDatasetKind.Rooms) {
			return Promise.reject(new InsightError("Rooms dataset is not supported"));
		}
		if (id.includes("_") || id.trim() === "") {
			return Promise.reject(new InsightError("Invalid id"));
		}

		const zipContent: Array<{[file: string]: string}> = [];
		const promises: Array<Promise<string>> = [];
		// jsZip.loadAsync(content, {base64: true})
		// 	.then(function (zip) {
				// console.log("zip is ", zip);
				// zip.forEach(async (relativePath, file) => {
				// 	// console.log("file is " + relativePath);
				// 	const promise = file.async("string");
				// 	promises.push(promise);
				// 	zipContent.push({
				// 		file: relativePath,
				// 		content: await promise
				// 	});
				// });
			// 	console.log(zip.files["courses/ZOOL649"]);
			// 	return zip.files["courses/ZOOL649"].async("text").then(function (txt) {
			// 		console.log("text is " + txt);
			// 	});
			// });

		jsZip.loadAsync(content,{base64: true}).then(function (zip) {
			Object.keys(zip.files).forEach(function (filename) {
				console.log("file name " + filename);
				zip.files[filename].async("text").then(function (fileData) {
					console.log("file content " + fileData); // These are your file contents
				});
			});
		});
		return Promise.all(promises);
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {

		// return Promise.resolve(this.insights);

		return Promise.reject("Not implemented.");
	}
}
