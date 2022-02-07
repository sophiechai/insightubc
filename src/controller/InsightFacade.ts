import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
} from "./IInsightFacade";

import {checkValidSection, writeToData, removeItem} from "./DatasetHelperFunctions";

import JSZip from "jszip";
import fse from "fs-extra";
import {isQueryValid} from "./ValidateQuery";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
let jsZip: JSZip;
let addedIds: string[];
let addedDatasets: InsightDataset[];
let dataPath = __dirname + "/../../data";

export default class InsightFacade implements IInsightFacade {
	constructor() {
		jsZip = new JSZip();
		addedIds = [];
		addedDatasets = [];
		// console.log("InsightFacadeImpl::init()");
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
					if (dataObj.length === 0) {
						// console.log("empty");
					} else {
						dataObj.forEach((section: any) => {
							// console.log("section is " + JSON.stringify(section));
							const validSection = checkValidSection(section);
							if (validSection) {
								tempList.push(section);
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
			console.log("File successfully deleted.");
			return Promise.resolve(id);
		} catch (err) {
			console.error(err);
			return Promise.reject(new InsightError("unlinkSync failed"));
		}
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		console.log("THIS IS THE QUERY INPUT: ", query);
		let q: any = query;
		// console.log("THIS IS THE QUERY OBJECT CAST TO ANY: ");
		// console.log(q);
		let isValid = isQueryValid(q, addedIds);
		console.log("ISVALID IS OF TYPE: ", typeof isValid);
		if (typeof isValid !== "boolean") {
			return Promise.reject(isValid);
		}

		// figure out which dataset to query
		let whereOptionsValues: object[] = Object.values(q);
		console.log("ARRAY WITH WHERE AND OPTION VALUES: ", whereOptionsValues);
		let optionsValue: object = whereOptionsValues[1];
		console.log("OPTIONS VALUE: ", optionsValue);
		let columnsValue: object[] = Object.values(optionsValue);
		console.log("COLUMNS VALUE: ", columnsValue);
		let keysArray: any = columnsValue[0];
		console.log("THE KEYS ARRAY: ", keysArray);
		let key: string = keysArray[0];
		console.log("THE KEY: ", key);
		let underscoreIdx = key.indexOf("_");
		let idSubstring = key.substring(0,underscoreIdx);
		console.log(idSubstring);
		// get the data from json file... grab the content array store in a local variable
		let data = [];
		// Then call filter() which returns resulting array...?
		// Then create the InsightResult objects and put in array
		// Then need helper function? that will sort in the order specified (if any)
		return Promise.resolve([]);
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve(addedDatasets);
	}
}
