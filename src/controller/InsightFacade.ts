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

import JSZip from "jszip";
import fse from "fs-extra";
import * as fs from "fs-extra";
import {filter, createInsightResult, checkSectionArrayFinalLength, applyTransformation} from "./Filter";
import {sortResult} from "./Filter2";
import {ValidateQueryMain} from "./ValidateQueryMain";
import {ValidateQueryCourses} from "./ValidateQueryCourses";
import {ValidateQueryRooms} from "./ValidateQueryRooms";
import {Rooms} from "./Rooms";
import {Dataset} from "./Dataset";
import {Sections} from "./Sections";

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

export let datasetArray: Dataset[];

export default class InsightFacade implements IInsightFacade {
	constructor() {
		jsZip = new JSZip();
		addedIds = [];
		addedDatasets = [];
		mapForEachFormattedSection = new Map<string, number | string>();
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
		datasetArray = [];
		let q: any = query;
		let id = "";
		let kind = "";
		try {
			kind = this.decideKind(q);
			let validateQueryObject: ValidateQueryMain = this.instantiateValidateObject(q, kind);
			id = validateQueryObject.isQueryValid();
			if (!addedIds.includes(id)) {
				throw new InsightError("Dataset ID does not exist");
			}
		} catch (err) {
			return Promise.reject(err);
		}
		let jsonContent: string;
		try {
			jsonContent = fs.readFileSync("data/" + id + ".json").toString("utf8");
		} catch (err) {
			return Promise.reject(new InsightError("Reading file not found"));
		}
		let parsedJsonContent = JSON.parse(jsonContent);
		let header: object = parsedJsonContent.header;
		if (Object.values(header)[1] !== kind) {
			return Promise.reject(new InsightError("Mismatched dataset kind and keys"));
		}
		let content: any[] = parsedJsonContent.contents;
		for (const item of content) {
			if (kind === "courses") {
				datasetArray.push(new Sections(item));
			} else {
				datasetArray.push(new Rooms(item));
			}
		}
		return this.query(q, id);
	}

	private query(q: any, id: string) {
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
		let optionsValue = q.OPTIONS;
		let columnsValue = optionsValue.COLUMNS;
		// apply transformation
		let newMap: Map<string, Dataset[]> = new Map();
		let aggregateMap: Map<string, number[]> = new Map();
		if (Object.prototype.hasOwnProperty.call(q, "TRANSFORMATIONS")) {
			newMap = new Map(applyTransformation(q.TRANSFORMATIONS, columnsValue, newMap, aggregateMap));
		}
		// Figure out which dataset to query
		createInsightResult(columnsValue, id, insightResultArray, newMap, aggregateMap);
		console.log("YEY");
		if (Object.prototype.hasOwnProperty.call(optionsValue, "ORDER")) {
			let orderKey = optionsValue.ORDER;
			sortResult(orderKey, insightResultArray);
		}
		return Promise.resolve(insightResultArray);
	}

	private instantiateValidateObject(q: object, kind: string): ValidateQueryMain {
		if (kind === InsightDatasetKind.Courses) {
			return new ValidateQueryCourses(q);
		} else {
			return new ValidateQueryRooms(q);
		}
	}

	private decideKind(query: object): string {
		let keys = Object.keys(query);
		if (keys.length < 2 || keys[1] !== "OPTIONS") {
			throw new InsightError("asdfghjkl");
		}
		let optionsValue = Object.values(query)[1];
		let optionsKeys = Object.keys(optionsValue);
		if (optionsKeys.length === 0 || optionsKeys[0] !== "COLUMNS") {
			throw new InsightError("asdfghjkl");
		}
		let columnsValue: any = Object.values(optionsValue)[0];
		if (!Array.isArray(columnsValue) || columnsValue.length === 0) {
			throw new InsightError("asdfghjkl");
		}
		let key: string = columnsValue[0];
		if (!key.includes("_")) {
			throw new InsightError("asdfghjkl");
		}
		let property: string = key.substring(key.indexOf("_") + 1);
		switch (property) {
			case "dept":
			case "id":
			case "instructor":
			case "title":
			case "avg":
			case "pass":
			case "fail":
			case "audit":
			case "year":
			case "uuid":
				return "courses";
			case "fullname":
			case "shortname":
			case "number":
			case "name":
			case "address":
			case "type":
			case "furniture":
			case "href":
			case "lat":
			case "lon":
			case "seats":
				return "rooms";
			default:
				throw new InsightError("asdfghjkl");
		}
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve(addedDatasets);
	}
}
