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
import {filter, createInsightResult, checkSectionArrayFinalLength} from "./Filter";
import {applyTransformation} from "./Transformation";
import {sortResult} from "./Sort";
import {ValidateQueryMain} from "./ValidateQueryMain";
import {ValidateQueryCourses} from "./ValidateQueryCourses";
import {ValidateQueryRooms} from "./ValidateQueryRooms";
import {Rooms} from "./Rooms";
import {Dataset} from "./Datasets";
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
		// jsZip = new JSZip();
		addedIds = [];
		addedDatasets = [];
		this.loadData();
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
		if (content === null || content === undefined || content === "") {
			return Promise.reject(new InsightError("Invalid input string"));
		}
		jsZip = new JSZip();
		if (id.includes("_") || id.trim() === "" || addedIds.includes(id)) {
			return Promise.reject(new InsightError("Invalid id"));
		}

		try {
			if (kind === InsightDatasetKind.Rooms) {
				return jszipRooms(jsZip, id, content, kind, addedIds, addedDatasets);
			} else if (kind === InsightDatasetKind.Courses) {
				return jszipCourses(jsZip, id, content, kind, addedIds, addedDatasets);
			} else {
				console.log("NOT ROOM NOT COURSES");
			}
			return Promise.reject();
		} catch (err) {
			throw new InsightError("zip error");
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
				// console.log("Successfully removed file!");
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
		if (query === undefined || query === null || query === "") {
			throw new InsightError("Undefined or missing query input");
		}
		datasetArray = [];
		let q: any = query;
		let id = "";
		let kind = "";
		try {
			kind = this.decideKind(q);
			let validateQueryObject: ValidateQueryMain = InsightFacade.instantiateValidateObject(q, kind);
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
		return InsightFacade.query(q, id);
	}

	private static query(q: any, id: string) {
		let insightResultArray: InsightResult[] = [];
		filter(q.WHERE, "INIT");
		let optionsValue = q.OPTIONS;
		let columnsValue = optionsValue.COLUMNS;
		// apply transformation
		let newMap: Map<string, Dataset[]> = new Map();
		let aggregateMap: Map<string, Map<string, number>> = new Map();
		if (Object.prototype.hasOwnProperty.call(q, "TRANSFORMATIONS")) {
			newMap = new Map(applyTransformation(q.TRANSFORMATIONS, columnsValue, newMap, aggregateMap));
		}
		try {
			checkSectionArrayFinalLength(newMap);
		} catch (err) {
			if (err instanceof InsightError) {
				return Promise.resolve(insightResultArray);
			} else if (err instanceof ResultTooLargeError) {
				return Promise.reject(err);
			}
		}
		createInsightResult(columnsValue, id, insightResultArray, newMap, aggregateMap);
		if (Object.prototype.hasOwnProperty.call(optionsValue, "ORDER")) {
			sortResult(optionsValue.ORDER, insightResultArray);
		}
		return Promise.resolve(insightResultArray);
	}

	private static instantiateValidateObject(q: object, kind: string): ValidateQueryMain {
		if (kind === "courses") {
			return new ValidateQueryCourses(q);
		} else {
			return new ValidateQueryRooms(q);
		}
	}

	private decideKind(query: any): string {
		let property: string = "";
		if (Object.prototype.hasOwnProperty.call(query, "TRANSFORMATIONS")) {
			let transValue = query.TRANSFORMATIONS;
			if (!Object.prototype.hasOwnProperty.call(transValue, "GROUP")) {
				throw new InsightError("Missing GROUP in TRANSFORMATIONS");
			}
			let groupValue = transValue.GROUP;
			if (!Array.isArray(groupValue) || groupValue.length === 0) {
				throw new InsightError("GROUP value not valid");
			}
			let key: string = groupValue[0];
			if (!key.includes("_")) {
				throw new InsightError("Incorrect key in GROUP");
			}
			property = key.substring(key.indexOf("_") + 1);
		} else {
			if (!Object.prototype.hasOwnProperty.call(query, "OPTIONS")) {
				throw new InsightError("Missing OPTIONS");
			}
			let optionsValue = query.OPTIONS;
			if (!Object.prototype.hasOwnProperty.call(optionsValue, "COLUMNS")) {
				throw new InsightError("Missing COLUMNS");
			}
			let columnsValue: string[] = optionsValue.COLUMNS;
			if (!Array.isArray(columnsValue) || columnsValue.length === 0) {
				throw new InsightError("COLUMNS value invalid");
			}
			let key = columnsValue[0];
			if (!key.includes("_")) {
				throw new InsightError("Invalid key in COLUMNS");
			}
			property = key.substring(key.indexOf("_") + 1);
		}
		return InsightFacade.getKindString(property);
	}

	private static getKindString(property: string) {
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
				throw new InsightError("Invalid key property");
		}
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve(addedDatasets);
	}

	private loadData() {
		if (fs.existsSync(dataPath)) {
			const files = fse.readdirSync(dataPath);
			for (const f of files) {
				let fileContent = fse.readFileSync(dataPath + "/" + f).toString("utf8");
				let jsonObj = JSON.parse(fileContent);
				let headerValue = jsonObj["header"];
				let id = headerValue["id"];
				addedDatasets.push(headerValue);
				addedIds.push(id);
			}
		}
	}
}
