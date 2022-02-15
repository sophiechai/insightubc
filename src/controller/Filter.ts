import {InsightResult} from "./IInsightFacade";
import {contentArray} from "./InsightFacade";

let data: object[];

// TRUST THE NATURAL RECURSION...
export function filter(instruction: object, dataArray: object[]): object[] {
	data = dataArray;
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let v = values[0];
	// console.log("THIS IS THE KEYS ARRAY: ", keys);
	// console.log("THIS IS THE KEY: ", keys[0]);
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
			for (const inst of v) {
				data = filter(inst, data);
			}
			break;
		case "OR":
			data = filterOR(v, data);
			break;
		case "NOT":
			data = filter(v, data);
			data = filterNOT();
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
	let v: string = values[0];
	// console.log("THE STRING TO MATCH: ", v);
	// Get the substring for what specific section I need to compare
	let underscoreIdx = k.indexOf("_");
	let section = k.substring(underscoreIdx + 1);
	// Get the correct corresponding string for that section in raw data
	let rawDataSection = getDataKeyString(section);
	// All strings are OK so return entire data
	if (v === "*") {
		return data;
	}
	// Check if input string has asterisk at beginning and/or end
	let beginAsteriskIdx = v.indexOf("*");
	let endAsteriskIdx = v.indexOf("*", 1);
	for (const d of data) {
		// Get value of that section of the raw data
		let sections = Object.keys(d);
		let sectionValues = Object.values(d);
		let sectionIdx = sections.indexOf(rawDataSection);
		let sectionValue = sectionValues[sectionIdx];
		// console.log("SECTION VALUE I CHECK: ", sectionValue);
		// Beginning only asterisk
		if (beginAsteriskIdx !== -1 && endAsteriskIdx === -1) {
			if (beginningAsteriskOnly(v, sectionValue)) {
				result.push(d);
			}
		} else if (beginAsteriskIdx === -1 && endAsteriskIdx !== -1) {
			if (endAsteriskOnly(v, sectionValue)) {
				result.push(d);
			}
		} else if (beginAsteriskIdx !== -1 && endAsteriskIdx !== -1) {
			let inputSubstr = v.substring(1, v.length - 1);
			let idx = sectionValue.indexOf(inputSubstr);
			if (idx !== -1) {
				result.push(d);
			}
		} else {
			if (v === sectionValue) {
				result.push(d);
			}
		}
	}
	return result;
}

function beginningAsteriskOnly(inputString: string, sectionValue: string): boolean {
	let inputSubstr = inputString.substring(1);
	// Check if the value has the substring
	let idx = sectionValue.indexOf(inputSubstr);
	if (idx === -1) {
		return false;
	}
	let valSubstr = sectionValue.substring(idx);
	return valSubstr === inputSubstr;
}

function endAsteriskOnly(inputString: string, sectionValue: string): boolean {
	let inputSubstr = inputString.substring(0, inputString.length - 1);
	// console.log("HOPE I INDEXED CORRECTLY SUBSTRING: ", inputSubstr);
	// Check if the value has the substring
	let idx = sectionValue.indexOf(inputSubstr);
	return !(idx === -1 || idx !== 0);
}

export function filterOR(instruction: object[], ogData: object[]): object[] {
	let result: object[] = [];
	for (const inst of instruction) {
		data = filter(inst, ogData);
		result = result.concat(data);
	}
	// let stringified: string[] = [];
	// // console.log("LENGTH OF STRINGIFIED: ", stringified.length);
	// for (const r of result) {
	// 	stringified.push(JSON.stringify(r));
	// }
	// let res = stringified.filter(function(element, index,array) {
	// 	return array.indexOf(element) === index;
	// });
	// let newResult = [];
	// for (const r of res) {
	// 	newResult.push(JSON.parse(r));
	// }
	// return newResult;
	let set = new Set(result);
	return Array.from(set);
}

export function filterNOT(): object[] {
	let original = contentArray;
	for (const d of data) {
		for (const o of original) {
			if (JSON.stringify(d) === JSON.stringify(o)) {
				let idx = original.indexOf(o);
				original.splice(idx, 1);
				// console.log("I AM REMOVING ELEMENT OF IDX: ", idx);
			}
		}
	}
	// console.log("RESULTING ARRAY: ", contentArray);
	return original;
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
	// console.log("INSIGHT RESULT OBJECT: ", insightResult);
	return insightResult;
}

export function sortResult(array: object[], orderKey: string): object[] {
	let underscoreIdx = orderKey.indexOf("_");
	let substring = orderKey.substring(underscoreIdx + 1);
	let key = getDataKeyString(substring);
	array.sort(function (a, b) {
		let propIdxA = Object.keys(a).indexOf(key);
		let propIdxB = Object.keys(b).indexOf(key);
		let valueA = Object.values(a)[propIdxA];
		let valueB = Object.values(b)[propIdxB];
		if (valueA < valueB) {
			return -1;
		}
		if (valueA > valueB) {
			return 1;
		}
		return 0;
	});
	return array;
}
