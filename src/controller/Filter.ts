import {InsightResult} from "./IInsightFacade";
import {Sections} from "./Sections";
import {sectionArray} from "./InsightFacade";
import {access} from "fs";

let section: Sections[];

// TRUST THE NATURAL RECURSION...
export function filter(instruction: object, message: string) {
	section = sectionArray;

	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let v = values[0];
	// console.log("THIS IS THE KEYS ARRAY: ", keys);
	// console.log("THIS IS THE KEY: ", keys[0]);
	switch (keys[0]) {
		case "GT":
			filterGT(v, message);
			break;
		case "LT":
			filterLT(v, message);
			break;
		case "EQ":
			filterEQ(v, message);
			break;
		case "IS":
			filterIS(v, message);
			break;
		case "AND":
			filterAND(v);
			break;
		case "OR":
			filterOR(v);
			break;
		// case "NOT":
		// 	filterNOT(v, message);
		// 	break;
		default:
			console.log("UNEXPECTED CASE");
	}
}

function getProperty(input: string): string {
	let idx = input.indexOf("_");
	let str = input.substring(idx + 1);
	return str;
}

export function filterGT(instruction: object, message: string) {
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v: number = values[0];
	// Get the substring for what specific section I need to compare
	let property = getProperty(k);
	if (message === "OR") {
		for (const item of section) {
			let x: string | number = item.map.get(property)!;
			if (x > v) {
				item.flag = 1;
			}
		}
	} else {
		section = section.filter((x) => x.map.get(property)! > v);
	}
}

export function filterLT(instruction: object, message: string) {
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v: number = values[0];
	// Get the substring for what specific section I need to compare
	let property = getProperty(k);
	if (message === "OR") {
		for (const item of section) {
			let x: string | number = item.map.get(property)!;
			if (x < v) {
				item.flag = 1;
			}
		}
	} else {
		section = section.filter((x) => x.map.get(property)! < v);
	}
}

export function filterEQ(instruction: object, message: string) {
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v: number = values[0];
	// Get the substring for what specific section I need to compare
	let property = getProperty(k);
	if (message === "OR") {
		for (const item of section) {
			let x: string | number = item.map.get(property)!;
			if (x === v) {
				item.flag = 1;
			}
		}
	} else {
		section = section.filter((x) => x.map.get(property)! === v);
	}
}

export function filterIS(instruction: object, message: string) {
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v: string = values[0];
	// Get the substring for what specific section I need to compare
	let property = getProperty(k);
	if (v.charAt(0) === "*" && v.charAt(v.length - 1) === "*") {
		v = v.substring(1, v.length - 1);
		if (message === "OR") {
			section.forEach((x) => (x.flag = 1));
		}
	} else if (v.charAt(0) === "*") {
		v = v.substring(1);
		if (message === "OR") {
			for (const item of section) {
				let x: string | number = item.map.get(property)!;
				if (String(x).endsWith(v)) {
					item.flag = 1;
				}
			}
		} else {
			section = section.filter((x) => String(x.map.get(property)!).endsWith(v));
		}
	} else if (v.charAt(v.length - 1) === "*") {
		v = v.substring(0, v.length - 1);
		if (message === "OR") {
			for (const item of section) {
				let x: string | number = item.map.get(property)!;
				if (String(x).startsWith(v)) {
					item.flag = 1;
				}
			}
		} else {
			section = section.filter((x) => String(x.map.get(property)!).startsWith(v));
		}
	} else {
		if (message === "OR") {
			for (const item of section) {
				let x: string | number = item.map.get(property)!;
				if (x === v) {
					item.flag = 1;
				}
			}
		} else {
			section = section.filter((x) => x.map.get(property)! === v);
		}
	}
}

export function filterAND(instruction: object[]) {
	for (const item of instruction) {
		filter(item, "");
	}
}

export function filterOR(instruction: object[]) {
	for (const item of instruction) {
		filter(item, "OR");
	}
	section = section.filter((x) => x.flag === 1);
	section.forEach((x) => (x.flag = 0));
}

export function filterNOT() {
	// let original = contentArray;
	// for (const d of data) {
	// 	for (const o of original) {
	// 		if (JSON.stringify(d) === JSON.stringify(o)) {
	// 			let idx = original.indexOf(o);
	// 			original.splice(idx, 1);
	// 			// console.log("I AM REMOVING ELEMENT OF IDX: ", idx);
	// 		}
	// 	}
	// }
	// // console.log("RESULTING ARRAY: ", contentArray);
	// return original;
}

export function createInsightResult(columnKeys: string[], id: string, resultArray: InsightResult[]) {
	let output: any = {};
	// let resultArray: InsightResult[] = [];
	for (const item of section) {
		for (const item1 of columnKeys) {
			console.log("column: ", item1);
			console.log("item: ", item.map.get(getProperty(item1)));
			output[item1] = item.map.get(getProperty(item1));
		}
		resultArray.push({...output});
	}
}

export function sortResult(orderKey: string) {
	let sortOn: string = getProperty(orderKey);

	section.sort((a: Sections, b: Sections) => {
		let fa = a.map.get(sortOn)!;
		let fb = b.map.get(sortOn)!;

		if (fa < fb) {
			return -1;
		}
		if (fa > fb) {
			return 1;
		}
		return 0;
	});
}
