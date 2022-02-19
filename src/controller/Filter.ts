import {InsightError, InsightResult, ResultTooLargeError} from "./IInsightFacade";
import {Sections} from "./Sections";
import {sectionArray} from "./InsightFacade";
// import {access} from "fs";

let section: Sections[];

// TRUST THE NATURAL RECURSION...
export function filter(instruction: object, message: string) {
	if (message === "INIT") {
		section = sectionArray;
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
			console.log("UNEXPECTED CASE");
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
	section = section.filter((x) => x.map.get(property)! > v);
}

export function filterLT(instruction: object) {
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v: number = values[0];
	// Get the substring for what specific section I need to compare
	let property = getProperty(k);
	section = section.filter((x) => x.map.get(property)! < v);
}

export function filterEQ(instruction: object) {
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v: number = values[0];
	// Get the substring for what specific section I need to compare
	let property = getProperty(k);
	section = section.filter((x) => x.map.get(property)! === v);
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
		section = section.filter((x) => String(x.map.get(property)!).includes(v));
	} else if (v.charAt(0) === "*") {
		v = v.substring(1);
		section = section.filter((x) => String(x.map.get(property)!).endsWith(v));
	} else if (v.charAt(v.length - 1) === "*") {
		v = v.substring(0, v.length - 1);
		section = section.filter((x) => String(x.map.get(property)!).startsWith(v));
	} else {
		section = section.filter((x) => x.map.get(property)! === v);
	}
}

export function filterAND(instruction: object[]) {
	for (const item of instruction) {
		filter(item, "");
	}
}

export function filterOR(instruction: object[]) {
	let beforeOR: Sections[] = Object.assign([], section);
	let unionSet: Sections[] = [];
	for (const item of instruction) {
		section = Object.assign([], beforeOR);
		filter(item, "");
		unionSet = [...new Set([...unionSet, ...section])];
	}
	// section = section.filter((x) => x.orFlag === 1);
	// section.forEach((x) => (x.orFlag = 0));
	section = unionSet;
}

export function filterNOT(instruction: object[]) {
	let beforeNOT: Sections[] = Object.assign([], section);
	filter(instruction, "");
	section = beforeNOT.filter((n) => !section.includes(n));
}

export function createInsightResult(columnKeys: string[], id: string, resultArray: InsightResult[]) {
	let output: any = {};
	for (const item of section) {
		for (const item1 of columnKeys) {
			// console.log("column: ", item1);
			// console.log("item: ", item.map.get(getProperty(item1)));
			output[item1] = item.map.get(getProperty(item1));
		}
		resultArray.push({...output});
	}
}

export function sortResult(orderKey: string, resultArray: InsightResult[]) {
	sort(orderKey, resultArray);
	// timSort.sort(resultArray, (a: InsightResult, b: InsightResult) => {
	// 	let fa = a[orderKey];
	// 	let fb = b[orderKey];
	// 	if (fa < fb) {
	// 		return -1;
	// 	}
	// 	if (fa > fb) {
	// 		return 1;
	// 	}
	// 	return 0;
	// });
}

function sort(orderKey: string, arr: InsightResult[]) {
	let n = arr.length;

	// Build heap (rearrange array)
	for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
		heapify(arr, n, i, orderKey);
	}

	// One by one extract an element from heap
	for (let i = n - 1; i > 0; i--) {
		// Move current root to end
		let temp = arr[0];
		arr[0] = arr[i];
		arr[i] = temp;

		// call max heapify on the reduced heap
		heapify(arr, i, 0, orderKey);
	}
}

// To heapify a subtree rooted with node i which is
// an index in arr[]. n is size of heap
function heapify(arr: InsightResult[], n: number, i: number, orderKey: string) {
	let largest = i; // Initialize largest as root
	let l = 2 * i + 1; // left = 2*i + 1
	let r = 2 * i + 2; // right = 2*i + 2

	// If left child is larger than root
	if (l < n && arr[l][orderKey] > arr[largest][orderKey]) {
		largest = l;
	}

	// If right child is larger than largest so far
	if (r < n && arr[r][orderKey] > arr[largest][orderKey]) {
		largest = r;
	}

	// If largest is not root
	if (largest !== i) {
		let swap = arr[i];
		arr[i] = arr[largest];
		arr[largest] = swap;

		// Recursively heapify the affected sub-tree
		heapify(arr, n, largest, orderKey);
	}
}

// function numberCompare(a: InsightResult,b: InsightResult, orderKey: string) {
// 	let fa = a[orderKey];
// 	let fb = b[orderKey];
// 	if (fa < fb) {
// 		return -1;
// 	}
// 	if (fa > fb) {
// 		return 1;
// 	}
// 	return 0;
// }

export function checkSectionArrayFinalLength() {
	if (section.length === 0) {
		throw new InsightError("Resolved");
	}
	if (section.length > 5000) {
		throw new ResultTooLargeError("Result over 5000");
	}
}
