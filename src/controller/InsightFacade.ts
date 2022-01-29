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
			return Promise.reject(InsightError);
		}
		// js_zip.loadAsync(content, {base64: true})
		// 	.then(function (zip) {
		// 		zip.forEach(async (relativePath, file) => {
		// 			const promise = file.async('string')
		// 			promises.push(promise)
		// 			zipContent.push({
		// 			  file: relativePath,
		// 			  content: await promise
		// 			})
		// 		  })
		// const zipContent: Array<{[file: string]: string}> = [];
		// const promises: Array<Promise<string>> = [];
		// js_zip.loadAsync(content)
		// 	.then(function (zip) {
		// 		zip.forEach(async (relativePath, file) => {
		// 			console.log("file is " + relativePath);
		// 			const promise = file.async("string");
		// 			promises.push(promise);
		// 			zipContent.push({
		// 				file: relativePath,
		// 				content: await promise
		// 			});
		// 		});
		// 		console.log("zipContent is " + zipContent);
		// 	});
		// return Promise.all(promises);
		// return zipContent

		const zipContent: Array<{[file: string]: string}> = [];
		const promises: Array<Promise<string>> = [];
		await jsZip.loadAsync(content)
			.then(function (zip) {
				console.log("zipContent is" + zip.files["courses/LARC502.txt"]);
				// zip.forEach(async (relativePath, file) => {
				// 	console.log("file is " + relativePath);
				// 	const promise = file.async("string");
				// 	promises.push(promise);
				// 	zipContent.push({
				// 		file: relativePath,
				// 		content: await promise
				// 	});
				// });
				// console.log("zipContent is " + zipContent);
			});
		// fse.readFile("./test/resources/archives/courses.zip", function (err, data) {
		// 	if (err) throw err;
		// 	var zip = new JSZip();
		// 	zip.loadAsync(data);
		// }
		// const zipContent = [];
		// const promises: Array<Promise<string>> = [];
		// const zip = (await JSZip.loadAsync(content));
		// zip.forEach(async (relativePath, file) => {
		// 	const promise = file.async("string");
		// 	promises.push(promise);
		// 	zipContent.push({
		// 		file: relativePath,
		// 		content: await promise
		// 	});
		// });

		// await Promise.all(promises);

			// .then(function (zip) {
			// 	console.log(zip.files["courses/LARC502.txt"]); // .async("string");
			// 	return zip.files["courses/LARC502.txt"].async("string");
			// });
		return Promise.reject("Not implemented.");
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
