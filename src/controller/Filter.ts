import {InsightError, InsightResult, ResultTooLargeError} from "./IInsightFacade";
import {Sections} from "./Sections";
import {datasetArray} from "./InsightFacade";
import {Rooms} from "./Rooms";
import {Dataset} from "./Dataset";
import Decimal from "decimal.js";

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

export function getProperty(input: string): string {
	let idx = input.indexOf("_");
	return input.substring(idx + 1);
}

export function filterGT(instruction: object) {
	let k = Object.keys(instruction)[0];
	let v: number = Object.values(instruction)[0];
	// Get the substring for what specific section I need to compare
	let property = getProperty(k);
	dataset = dataset.filter((x) => x.map.get(property)! > v);
}

export function filterLT(instruction: object) {
	let k = Object.keys(instruction)[0];
	let v: number = Object.values(instruction)[0];
	// Get the substring for what specific section I need to compare
	let property = getProperty(k);
	dataset = dataset.filter((x) => x.map.get(property)! < v);
}

export function filterEQ(instruction: object) {
	let k = Object.keys(instruction)[0];
	let v: number = Object.values(instruction)[0];
	// Get the substring for what specific section I need to compare
	let property = getProperty(k);
	dataset = dataset.filter((x) => x.map.get(property)! === v);
}

export function filterIS(instruction: object) {
	let k = Object.keys(instruction)[0];
	let v: string = Object.values(instruction)[0];
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

export function createInsightResult(
	columnKeys: string[],
	id: string,
	resultArray: InsightResult[],
	newMap: Map<string, Dataset[]>,
	aggregateMap: Map<string, number[]>
) {
	let output: any = {};
	if (newMap.size === 0) {
		for (const item of dataset) {
			for (const item1 of columnKeys) {
				output[item1] = item.map.get(getProperty(item1));
			}
			resultArray.push({...output});
		}
	} else {
		for (const entry of newMap) {
			let count = 0;
			for (const item1 of columnKeys) {
				let value = entry[1][0].map.get(getProperty(item1));
				if (value === undefined) {
					output[item1] = aggregateMap.get(entry[0] + "")![count];
					count++;
				} else {
					output[item1] = value;
				}
			}
			resultArray.push({...output});
		}
	}
}

export function checkSectionArrayFinalLength(newMap: Map<string, Dataset[]>) {
	if (newMap.size === 0) {
		if (dataset.length === 0) {
			throw new InsightError("Resolved");
		}
		if (dataset.length > 5000) {
			throw new ResultTooLargeError("Result over 5000");
		}
	} else {
		if (newMap.size > 5000) {
			throw new ResultTooLargeError("Result over 5000");
		}
	}
}
export function applyGroup(groupArray: string[], newMap: Map<string, Dataset[]>) {
	let property: string = getProperty(groupArray[0]);
	for (const item of dataset) {
		let roomValue: any = item.map.get(property);
		if (!newMap.has(roomValue)) {
			let value: Dataset[] = [];
			value.push(item);
			newMap.set(roomValue, value);
		} else {
			let value: Dataset[] = newMap.get(roomValue)!;
			value.push(item);
			newMap.set(roomValue, value);
		}
	}
	if (groupArray.length > 1) {
		for (let i = 1; i < groupArray.length; i++) {
			let tempMap: Map<string, Dataset[]> = new Map();
			for (let entry of newMap.entries()) {
				for (let j of entry[1]) {
					let property2: string = getProperty(groupArray[i]);
					let roomValue: any = j.map.get(property2);
					let key = entry[0] + "_" + roomValue;
					if (!tempMap.has(key)) {
						let value: Dataset[] = [];
						value.push(j);
						tempMap.set(key, value);
					} else {
						let value: Dataset[] = tempMap.get(key)!;
						value.push(j);
						tempMap.set(key, value);
					}
				}
			}
			newMap = tempMap;
		}
	}
	return newMap;
}

export function aggregate(command: string, newMap: Map<string, Dataset[]>, property: string,
	aggregateMap: Map<string, number[]>
) {
	for (let entry of newMap.entries()) {
		let key = entry[0];
		let value = entry[1];
		let tracker: number = 0;
		let avgSum: Decimal = new Decimal(0);
		let countArray: string[] = [];
		for (let data of value) {
			let x = data.map.get(property)!;
			if (command === "COUNT") {
				if (!countArray.includes(x.toString())) {
					countArray.push(x.toString());
				}
			} else {
				let num: number = Number(x);
				Number(data.map.get(property));
				if (command === "MAX") {
					if (num > tracker) {
						tracker = num;
					}
				} else if (command === "MIN") {
					if (num < tracker) {
						tracker = num;
					}
				} else if (command === "SUM") {
					tracker += num;
				} else {
					let total = new Decimal(num);
					avgSum = Decimal.add(avgSum, total);
				}
			}
		}
		if (command === "AVG") {
			tracker = avgSum.toNumber() / value.length;
		}
		if (command === "COUNT") {
			tracker = countArray.length;
		}
		let mapValue: number[];
		if (!aggregateMap.has(key)) {
			mapValue = [];
		} else {
			mapValue = aggregateMap.get(key)!;
		}
		mapValue.push(Number(tracker.toFixed(2)));
		aggregateMap.set(key, mapValue);
	}
}

// function countCommand(countArray: string[], data: string) {
// 	if (!countArray.includes(data)) {
// 		countArray.push(data);
// 	}
// }
