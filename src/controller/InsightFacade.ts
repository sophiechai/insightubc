import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
} from "./IInsightFacade";

import {checkValidSection} from "./DatasetVerifier";

import JSZip from "jszip";
import fse from "fs-extra";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
let jsZip: JSZip;
let addedIds: string[] = [];

export default class InsightFacade implements IInsightFacade {
	constructor() {
		jsZip = new JSZip();

		console.log("InsightFacadeImpl::init()");

		try {
			if (!fse.existsSync("./data")) {
				fse.mkdirSync("./data");
			}
		} catch (err) {
			console.error("make data error: " + err);
		}
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// content - fs.readFileSync("test/resources/archives/courses.zip").toString("base64")

		if (kind === InsightDatasetKind.Rooms) {
			return Promise.reject(new InsightError("Rooms dataset is not supported"));
		}
		// if (id.includes("_") || id.trim() === "") {
		// 	return Promise.reject(new InsightError("Invalid id"));
		// }
		if (addedIds.includes(id)) {
			return Promise.reject(new InsightError("Dataset already added"));
		}
		// OR
		// const idExisted = await fse.pathExists("data/" + id);
		// if (idExisted) {
		// 	return Promise.reject(new InsightError("Dataset already added"));
		// }

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

		let tempList: any[] = [];

		return jsZip.loadAsync(content, {base64: true}).then((zip) => {
			Object.keys(zip.files).forEach((filename) => {
				// console.log("file name " + filename);
				return zip.files[filename].async("text").then((fileData) => {
					// console.log("file content " + fileData); // These are your file contents
					const dataObj = JSON.parse(fileData)["result"];
					if (dataObj.length === 0) {
						console.log("empty");
					} else {
						dataObj.forEach((section: any) => {
							console.log("section is " + JSON.stringify(section));
							const validSection = checkValidSection(section);
							if (validSection) {
								tempList.push(section);
								console.log("tempList length 1: " + tempList.length);
								// return tempList;
							}
						});
					}
				});
			});
		}).then(() => {
			console.log("tempList length 2: " + tempList.length);

			if (tempList.length === 0) {
				return Promise.reject(new InsightError("Invalid dataset"));
			} else {
				console.log("tempList length: " + tempList.length);
				let data: InsightDataset = {id, kind, numRows: 0};
				addedIds.push(id);
				return Promise.resolve(addedIds);
			}
		});
		// console.log("tempList length: " + tempList.length);
		return Promise.resolve(addedIds);

		// return Promise.all(promises);
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
