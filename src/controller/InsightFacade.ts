import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";

// import {parseResult, removeItem, writeToData} from "./DatasetHelperFunctions";
import {removeItem, jszipCourses} from "./DatasetHelperFunctions";
import {jszipRooms} from "./RoomsHelperFunctions";
import {Sections} from "./Sections";

import JSZip from "jszip";
import fse, * as fs from "fs-extra";
import {checkSectionArrayFinalLength, createInsightResult, filter, sortResult} from "./Filter";
import {ValidateQueryMain} from "./ValidateQueryMain";
import {ValidateQueryCourses} from "./ValidateQueryCourses";
import {ValidateQueryRooms} from "./ValidateQueryRooms";

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

		const promises: Array<Promise<string>> = [];

		let tempList: any[] = [];

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
		let jsonContent;
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
			sectionArray.push(new Sections(item));
		}
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
		createInsightResult(columnsValue, id, insightResultArray);
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
			let columnsValue = optionsValue.COLUMNS;
			if (!Array.isArray(columnsValue) || columnsValue.length === 0) {
				throw new InsightError("COLUMNS value invalid");
			}
			let key = columnsValue[0];
			if (!key.includes("_")) {
				throw new InsightError("Invalid key in COLUMNS");
			}
			property = key.substring(key.indexOf("_") + 1);
		}
		return this.getKindString(property);
	}

	private getKindString(property: string) {
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
}
