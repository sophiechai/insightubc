import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";

import {removeItem, jszipCourses} from "./DatasetHelperFunctions";
import {jszipRooms} from "./RoomsHelperFunctions";
import {Sections} from "./Sections";

import JSZip from "jszip";
import fse from "fs-extra";
import * as fs from "fs-extra";
import {isQueryValid} from "./ValidateQuery";
import {filter, createInsightResult, sortResult, checkSectionArrayFinalLength} from "./Filter";
// import {} from "./FilterV2";

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
		if (id.includes("_") || id.trim() === "" || addedIds.includes(id)) {
			return Promise.reject(new InsightError("Invalid id"));
		}

		if (kind === InsightDatasetKind.Courses) {
			return jszipCourses(jsZip, id, content, kind, addedIds, addedDatasets);
		} else {
			return jszipRooms(jsZip, id, content, kind, addedIds, addedDatasets);
		}
	}

	public removeDataset(id: string): Promise<string> {
		if (id.includes("_") || id.trim() === "") {
			return Promise.reject(new InsightError("Invalid id"));
		}
		if (!addedIds.includes(id)) {
			return Promise.reject(new NotFoundError("Dataset not found"));
		}

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
			id = isQueryValid(q);
			// console.log("id: " + id);
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
