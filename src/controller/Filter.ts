import {InsightError, InsightResult, ResultTooLargeError} from "./IInsightFacade";
import {Sections} from "./Sections";
import {datasetArray} from "./InsightFacade";
import {Rooms} from "./Rooms";
import {Dataset} from "./Dataset";
// import {access} from "fs";

// let section: Sections[];
let dataset: Dataset[];

// TRUST THE NATURAL RECURSION...
export function filter(instruction: object, message: string) {
	if (message === "INIT") {
		// section = sectionArray;
		dataset = datasetArray;
	}
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let v = values[0];
	// console.log("THIS IS THE KEYS ARRAY: ", keys);
	// console.log("THIS IS THE KEY: ", keys[0]);
	switch (keys[0]) {
		case "GT":
			filterGT(v);
			break;
		case "LT":
			filterLT(v);
			break;
		case "EQ":
			filterEQ(v);
			break;
		case "IS":
			filterIS(v);
			break;
		case "AND":
			filterAND(v);
			break;
		case "OR":
			filterOR(v);
			break;
		case "NOT":
			filterNOT(v);
			break;
		default:
			console.log("NO FILTER");
	}
}

function getProperty(input: string): string {
	let idx = input.indexOf("_");
	let str = input.substring(idx + 1);
	return str;
}

export function filterGT(instruction: object) {
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v: number = values[0];
	// Get the substring for what specific section I need to compare
	let property = getProperty(k);
	dataset = dataset.filter((x) => x.map.get(property)! > v);
}

export function filterLT(instruction: object) {
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v: number = values[0];
	// Get the substring for what specific section I need to compare
	let property = getProperty(k);
	dataset = dataset.filter((x) => x.map.get(property)! < v);
}

export function filterEQ(instruction: object) {
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v: number = values[0];
	// Get the substring for what specific section I need to compare
	let property = getProperty(k);
	dataset = dataset.filter((x) => x.map.get(property)! === v);
}

export function filterIS(instruction: object) {
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v: string = values[0];
	// Get the substring for what specific section I need to compare
	let property = getProperty(k);
	if (v.charAt(0) === "*" && v.length === 1) {
		return;
	} else if (v.charAt(0) === "*" && v.charAt(v.length - 1) === "*") {
		v = v.substring(1, v.length - 1);
		dataset = dataset.filter((x) => String(x.map.get(property)!).includes(v));
	} else if (v.charAt(0) === "*") {
		v = v.substring(1);
		dataset = dataset.filter((x) => String(x.map.get(property)!).endsWith(v));
	} else if (v.charAt(v.length - 1) === "*") {
		v = v.substring(0, v.length - 1);
		dataset = dataset.filter((x) => String(x.map.get(property)!).startsWith(v));
	} else {
		dataset = dataset.filter((x) => x.map.get(property)! === v);
	}
}

export function filterAND(instruction: object[]) {
	for (const item of instruction) {
		filter(item, "");
	}
}

export function filterOR(instruction: object[]) {
	let beforeOR: Sections[] = Object.assign([], dataset);
	let unionSet: Sections[] = [];
	for (const item of instruction) {
		dataset = Object.assign([], beforeOR);
		filter(item, "");
		unionSet = [...new Set([...unionSet, ...dataset])];
	}
	// section = section.filter((x) => x.orFlag === 1);
	// section.forEach((x) => (x.orFlag = 0));
	dataset = unionSet;
}

export function filterNOT(instruction: object[]) {
	let beforeNOT: Sections[] = Object.assign([], dataset);
	filter(instruction, "");
	dataset = beforeNOT.filter((n) => !dataset.includes(n));
}

export function createInsightResult(columnKeys: string[], id: string, resultArray: InsightResult[]) {
	let output: any = {};
	for (const item of dataset) {
		for (const item1 of columnKeys) {
			// console.log("column: ", item1);
			// console.log("item: ", item.map.get(getProperty(item1)));
			output[item1] = item.map.get(getProperty(item1));
		}
		resultArray.push({...output});
	}
}

export function checkSectionArrayFinalLength() {
	if (dataset.length === 0) {
		throw new InsightError("Resolved");
	}
	if (dataset.length > 5000) {
		throw new ResultTooLargeError("Result over 5000");
	}
}

export function applyTransformation(instruction: object) {
	// hello
}
