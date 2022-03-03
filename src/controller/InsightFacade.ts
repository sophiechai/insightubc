import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";

import {writeToData, removeItem, parseResult} from "./DatasetHelperFunctions";
import {Sections} from "./Sections";

import JSZip from "jszip";
import fse from "fs-extra";
import * as fs from "fs-extra";
import {filter, createInsightResult, sortResult, checkSectionArrayFinalLength} from "./Filter";
import {ValidateQueryMain} from "./ValidateQueryMain";
import {ValidateQueryCourses} from "./ValidateQueryCourses";

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

export let sectionArray: Sections[];

export default class InsightFacade implements IInsightFacade {
	constructor() {
		jsZip = new JSZip();
		addedIds = [];
		addedDatasets = [];
		mapForEachFormattedSection = new Map<string, number | string>();
		// console.log("InsightFacadeImpl::init()");
		// console.log(dataPath);
		try {
			if (!fs.existsSync(dataPath)) {
				fse.mkdir(dataPath, function (err) {
					if (err) {
						console.log(err);
					} else {
						console.log("New directory successfully created.");
					}
				});
			}
		} catch (err) {
			console.log(err);
		}
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
				parseResult(promise, mapForEachFormattedSection, tempList);
				promises.push(promise);
			});
			return Promise.all(promises).then(() => {
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
		// const fileName = dataPath + "/" + id + ".json";
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

		const deleteFile = async (fileName: string) => {
			try {
				let index = addedIds.indexOf(id);
				addedIds = removeItem(addedIds, id);
				addedDatasets = removeItem(addedDatasets, addedDatasets[index]);
				await fse.unlink(fileName);
				console.log("Successfully removed file!");
				// console.log("File successfully deleted.");
				return Promise.resolve(id);
			} catch (err) {
				console.log(err);
			}
		};

		// Try it
		const fileName = dataPath + "/" + id + ".json";
		deleteFile(fileName).catch((err) => {
			console.log(err);
			return Promise.reject(new InsightError("unlinkSync failed"));
		});
		return Promise.resolve(id);
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		sectionArray = [];
		let q: any = query;
		let id = "";
		try {
			let validateQueryObject: ValidateQueryMain = new ValidateQueryCourses(q);
			id = validateQueryObject.isQueryValid();
			if (!addedIds.includes(id)) {
				throw new InsightError("Dataset ID does not exist");
			}
		} catch (err) {
			return Promise.reject(err);
		}
		// Get the data from json file... grab the content array
		let jsonContent;
		try {
			jsonContent = fs.readFileSync("data/" + id + ".json").toString("utf8");
		} catch (err) {
			return Promise.reject(new InsightError("Reading file not found"));
		}
		console.log("validate query passes");
		let parsedJsonContent = JSON.parse(jsonContent);
		let content: any[] = parsedJsonContent.contents;
		for (const item of content) {
			let section: Sections = new Sections(item);
			sectionArray.push(section);
		}
		// Call filter() which returns resulting array...
		let insightResultArray: InsightResult[] = [];
		filter(q.WHERE, "INIT");

		try {
			checkSectionArrayFinalLength();
		} catch (err) {
			if (err instanceof InsightError) {
				return Promise.resolve(insightResultArray);
			} else if (err instanceof ResultTooLargeError) {
				return Promise.reject(err);
			}
		}
		// Figure out which dataset to query
		let optionsValue = q.OPTIONS;
		let columnsValue = optionsValue.COLUMNS;
		// Create the InsightResult objects and put in insightResultArray
		createInsightResult(columnsValue, id, insightResultArray);
		// Check if it has ORDER property and then sort
		if (Object.prototype.hasOwnProperty.call(optionsValue, "ORDER")) {
			let orderKey = optionsValue.ORDER;
			sortResult(orderKey, insightResultArray);
		}

		return Promise.resolve(insightResultArray);
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve(addedDatasets);
	}
}
