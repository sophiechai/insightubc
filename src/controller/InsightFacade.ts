import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";

import {checkValidSection, formatSection, writeToData, removeItem} from "./DatasetHelperFunctions";

import JSZip from "jszip";
import fse from "fs-extra";
import * as fs from "fs-extra";
import {isQueryValid} from "./ValidateQuery";
import {createInsightResult, filter, sortResult} from "./Filter";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
let jsZip: JSZip;
let addedIds: string[];
let addedDatasets: InsightDataset[];
let dataPath = __dirname + "/../../data";
let mapForEachFormattedSection: Map<string, number | string>;

export let contentArray: object[];

export default class InsightFacade implements IInsightFacade {
	constructor() {
		jsZip = new JSZip();
		addedIds = [];
		addedDatasets = [];
		mapForEachFormattedSection = new Map<string, number | string>();
		console.log("InsightFacadeImpl::init()");
		console.log(dataPath);
		fse.mkdir(dataPath, function (err) {
			if (err) {
				console.log(err);
			} else {
				console.log("New directory successfully created.");
			}
		});
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// content - fs.readFileSync("test/resources/archives/courses.zip").toString("base64")

		if (kind === InsightDatasetKind.Rooms) {
			return Promise.reject(new InsightError("Rooms dataset is not supported"));
		}
		if (id.includes("_") || id.trim() === "" || addedIds.includes(id)) {
			return Promise.reject(new InsightError("Invalid id"));
		}
		// if (addedIds.includes(id)) {
		// 	return Promise.reject(new InsightError("Dataset already added"));
		// }
		// OR
		// const idExisted = await fse.pathExists("data/" + id);
		// if (idExisted) {
		// 	return Promise.reject(new InsightError("Dataset already added"));
		// }
		const promises: Array<Promise<string>> = [];

		let tempList: any[] = [];

		return jsZip.loadAsync(content, {base64: true}).then((zip) => {
			zip.forEach((relativePath, file) => {
				if (!relativePath.includes("courses/")) {
					promises.push(Promise.reject(new InsightError("invalid directory")));
				}
				// console.log("file is " + file);
				const promise = file.async("string");
				promise.then(function (fileData) {
					const dataObj = JSON.parse(fileData)["result"];
					if (dataObj.length !== 0) {
						dataObj.forEach((section: object) => {
							// console.log("section is " + JSON.stringify(section));
							const validSection = checkValidSection(section);
							if (validSection) {
								formatSection(mapForEachFormattedSection, section);
								let modifiedSection = Object.fromEntries(mapForEachFormattedSection);
								tempList.push(modifiedSection);
							}
						});
					}
				});
				promises.push(promise);
			});
			return Promise.all(promises).then((list) => {
				// console.log("tempList length 2: " + tempList.length);

				if (tempList.length === 0) {
					return Promise.reject(new InsightError("Invalid sections"));
				} else {
					// console.log("tempList length: " + tempList.length);
					let data: InsightDataset = {id, kind, numRows: tempList.length};
					const myJSON = JSON.stringify({header: data, contents: tempList});

					const fileName = dataPath + "/" + id + ".json";
					writeToData(fileName, myJSON);
					addedIds.push(id);
					addedDatasets.push(data);
					return Promise.resolve(addedIds);
				}
			});
		});
	}

	public removeDataset(id: string): Promise<string> {
		if (id.includes("_") || id.trim() === "") {
			return Promise.reject(new InsightError("Invalid id"));
		}
		if (!addedIds.includes(id)) {
			return Promise.reject(new NotFoundError("Dataset not found"));
		}
		const fileName = dataPath + "/" + id + ".json";
		try {
			fse.unlinkSync(fileName);
			let index = addedIds.indexOf(id);
			addedIds = removeItem(addedIds, id);
			addedDatasets = removeItem(addedDatasets, addedDatasets[index]);
			// console.log("File successfully deleted.");
			return Promise.resolve(id);
		} catch (err) {
			console.error(err);
			return Promise.reject(new InsightError("unlinkSync failed"));
		}

		// fse.unlink(fileName, function(err) {
		// 	if (err) {
		// 		// throw err;
		// 		return Promise.reject(new InsightError("unlinkSync failed"));
		// 	} else {
		// 		console.log("Successfully deleted the file.");
		// 		let index = addedIds.indexOf(id);
		// 		addedIds = removeItem(addedIds, id);
		// 		addedDatasets = removeItem(addedDatasets, addedDatasets[index]);
		//
		// 		return Promise.resolve(id);
		// 	}
		// });
		// return Promise.resolve(id);
		//
		// try {
		// 	fse.unlinkSync(fileName);
		// 	let index = addedIds.indexOf(id);
		// 	addedIds = removeItem(addedIds, id);
		// 	addedDatasets = removeItem(addedDatasets, addedDatasets[index]);
		// 	// console.log("File successfully deleted.");
		// 	return Promise.resolve(id);
		// } catch (err) {
		// 	console.error(err);
		// 	return Promise.reject(new InsightError("unlinkSync failed"));
		// }
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		// console.log("THIS IS THE QUERY INPUT: ", query);
		let q: any = query;
		let id = "";
		try {
			id = isQueryValid(q);
			// console.log("id: " + id);
			if (!addedIds.includes(id)) {
				throw new InsightError("Dataset ID does not exist");
			}
		}catch (err) {
			return Promise.reject(err);
		}
		console.log("validate query passes");
		// Figure out which dataset to query
		let optionsValue = q.OPTIONS;
		let columnsValue = optionsValue.COLUMNS;

		// Get the data from json file... grab the content array
		let jsonContent;
		try {
			console.log("id: " + id);
			jsonContent = fs.readFileSync("data/" + id + ".json").toString("utf8");
		} catch (err) {
			console.log("File not found");
			return Promise.reject(new InsightError("File not found"));
		}
		let parsedJsonContent = JSON.parse(jsonContent);
		let values: any[] = Object.values(parsedJsonContent);
		contentArray = values[1];
		// console.log("CONTENT ARRAY: ", contentArray);

		// Call filter() which returns resulting array...
		let insightResultArray: InsightResult[] = [];
		let result = filter(q.WHERE, contentArray);
		if (result.length === 0) {
			return Promise.resolve(insightResultArray);
		}
		if (result.length > 5000) {
			return Promise.reject(new ResultTooLargeError("Result over 5000"));
		}
		// Check if it has ORDER property and then sort
		let hasOrder = Object.prototype.hasOwnProperty.call(optionsValue, "ORDER");
		// console.log("HAS ORDER? ", hasOrder);
		if (hasOrder) {
			let orderKey = optionsValue.ORDER;
			result = sortResult(result, orderKey);
			// console.log("SORTED RESULT: ", result);
		}
		// Create the InsightResult objects and put in insightResultArray
		for (const res of result) {
			let ir = createInsightResult(res, columnsValue);
			insightResultArray.push(ir);
		}
		return Promise.resolve(insightResultArray);
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve(addedDatasets);
	}
}
