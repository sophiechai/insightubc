import {InsightResult} from "./IInsightFacade";

let data: object[];

// TRUST THE NATURAL RECURSION...
export function filter(instruction: object, dataArray: object[]): object[] {
	data = dataArray;
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let v = values[0];
	console.log("THIS IS THE KEYS ARRAY: ", keys);
	console.log("THIS IS THE KEY: ", keys[0]);
	switch (keys[0]) {
		case "GT":
			data = filterGT(v);
			break;
		case "LT":
			data = filterLT(v);
			break;
		case "EQ":
			data = filterEQ(v);
			break;
		case "IS":
			data = filterIS(v);
			break;
		case "AND":
			data = filterAND(v);
			break;
		case "OR":
			data = filterOR(v);
			break;
		case "NOT":
			data = filterNOT(v);
			break;
		default:
			console.log("UNEXPECTED CASE");
	}
	return data;
}

export function filterGT(instruction: object): object[] {
	let result: object[] = [];
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v: number = values[0];
	// Get the substring for what specific section I need to compare
	let underscoreIdx = k.indexOf("_");
	let section = k.substring(underscoreIdx + 1);
	// Get the correct corresponding string for that section in raw data
	let rawDataSection = getDataKeyString(section);
	for (const d of data) {
		// Get value of that section of the raw data
		let sections = Object.keys(d);
		let sectionValues = Object.values(d);
		let idx = sections.indexOf(rawDataSection);
		// Compare and place in result[] if meets requirement
		if (sectionValues[idx] > v) {
			result.push(d);
		}
	}
	// console.log("RESULT ARRAY: ", result);
	return result;
}

export function filterLT(instruction: object): object[] {
	let result: object[] = [];
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v: number = values[0];
	// Get the substring for what specific section I need to compare
	let underscoreIdx = k.indexOf("_");
	let section = k.substring(underscoreIdx + 1);
	// Get the correct corresponding string for that section in raw data
	let rawDataSection = getDataKeyString(section);
	for (const d of data) {
		// Get value of that section of the raw data
		let sections = Object.keys(d);
		let sectionValues = Object.values(d);
		let idx = sections.indexOf(rawDataSection);
		// Compare and place in result[] if meets requirement
		if (sectionValues[idx] < v) {
			result.push(d);
		}
	}
	// console.log("RESULT ARRAY: ", result);
	return result;
}

export function filterEQ(instruction: object): object[] {
	let result: object[] = [];
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v: number = values[0];
	// Get the substring for what specific section I need to compare
	let underscoreIdx = k.indexOf("_");
	let section = k.substring(underscoreIdx + 1);
	// Get the correct corresponding string for that section in raw data
	let rawDataSection = getDataKeyString(section);
	for (const d of data) {
		// Get value of that section of the raw data
		let sections = Object.keys(d);
		let sectionValues = Object.values(d);
		let idx = sections.indexOf(rawDataSection);
		// Compare and place in result[] if meets requirement
		if (sectionValues[idx] === v) {
			result.push(d);
		}
	}
	// console.log("RESULT ARRAY: ", result);
	return result;
}

export function filterIS(instruction: object): object[] {
	let result: object[] = [];
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v = values[0];
	return result;
}

export function filterAND(instruction: object): object[] {
	let result: object[] = [];
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v = values[0];
	return result;
}

export function filterOR(instruction: object): object[] {
	let result: object[] = [];
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v = values[0];
	return result;
}

export function filterNOT(instruction: object): object[] {
	let result: object[] = [];
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v = values[0];
	return result;
}

function getDataKeyString(str: string): string {
	switch (str) {
		case "dept":
			return "Subject";
		case "id":
			return "Course";
		case "avg":
			return "Avg";
		case "instructor":
			return "Professor";
		case "title":
			return "Title";
		case "pass":
			return "Pass";
		case "fail":
			return "Fail";
		case "audit":
			return "Audit";
		case "uuid":
			return "id";
		case "year":
			return "Year";
		default:
			return "";
	}
}

export function createInsightResult(result: object, columnKeys: string[]): InsightResult {
	let keys: string[] = [];
	for (const k of columnKeys) {
		let underscoreIdx = k.indexOf("_");
		let substring = k.substring(underscoreIdx + 1);
		keys.push(getDataKeyString(substring));
	}
	let indices: number[] = [];
	let properties: string[] = Object.keys(result);
	for (const k of keys) {
		indices.push(properties.indexOf(k));
	}
	let propertyValues = Object.values(result);
	let insightResult: InsightResult = {};
	for (let i = 0; i < columnKeys.length; i++) {
		let value = propertyValues[indices[i]];
		let k: string = columnKeys[i];
		insightResult[k] = value;
	}
	console.log("INSIGHT RESULT OBJECT: ", insightResult);
	return insightResult;
}
