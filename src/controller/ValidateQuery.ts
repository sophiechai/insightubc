// import {InsightError} from "./IInsightFacade";
//
// // let queryKeys: string[] = [];
// let currentQuery: string;
//
// // MAIN
// export function isQueryValid(query: object): string {
// 	// Initialize queryKeys and datasetIds array
// 	// Check if WHERE and OPTIONS are present
// 	try {
// 		let hasWhere: boolean = Object.prototype.hasOwnProperty.call(query, "WHERE");
// 		let hasOptions: boolean = Object.prototype.hasOwnProperty.call(query, "OPTIONS");
// 		if (!hasWhere) {
// 			throw new InsightError("Invalid query: No WHERE property found");
// 		}
// 		if (!hasOptions) {
// 			throw new InsightError("Invalid query: No OPTIONS property found");
// 		}
//
// 		let keys = Object.keys(query);
// 		if (keys.length > 2) {
// 			throw new InsightError("Invalid query: Has properties other than WHERE and OPTIONS");
// 		}
// 		if (keys[0] !== "WHERE" || keys[1] !== "OPTIONS") {
// 			throw new InsightError("Invalid query: Incorrect placement of WHERE and/or OPTIONS");
// 		}
// 		// Check if BODY and OPTIONS are valid
// 		let values = Object.values(query);
//
// 		isBodyValid(values[0]);
// 		isOptionsValid(values[1]);
// 		// console.log("id in validQuery " + currentQuery);
// 		return currentQuery;
// 	} catch (err) {
// 		if (err instanceof InsightError) {
// 			console.log(err.message);
// 			throw err;
// 		} else {
// 			throw err;
// 		}
// 	}
// }
//
// // BEGIN BODY VALIDITY CHECK
// // Checks body of query input
// export function isBodyValid(obj: object) {
// 	try {
// 		// Check number of filters; 0 or 1 filter is valid; >1 is invalid
// 		let keys = Object.keys(obj);
// 		if (keys.length === 0) {
// 			return;
// 		}
// 		if (keys.length > 1) {
// 			throw new InsightError("Length Invalid");
// 		}
// 		// Check syntax and semantic of Logic, MComp, SComp, Neg
// 		let values = Object.values(obj);
// 		let k = keys[0];
// 		let v = values[0];
// 		checkCommand(k, v);
// 	} catch (err) {
// 		if (err instanceof InsightError) {
// 			throw err;
// 		}
// 	}
// }
//
// // Checks LOGICCOMPARISON
// export function isLogicComparisonValid(array: object[]) {
// 	try {
// 		// Check if there is at least one FILTER in array
// 		if (array.length === 0) {
// 			throw new InsightError("Length Invalid");
// 		}
// 		if (!Array.isArray(array)) {
// 			throw new InsightError("Must be an array");
// 		}
// 		// Loop through array checking if valid filters
// 		for (const obj of array) {
// 			let keys = Object.keys(obj);
// 			let values = Object.values(obj);
// 			// Check there's only one key and value
// 			// console.log(typeof values[0]);
// 			if (keys.length !== 1 || values.length !== 1) {
// 				throw new InsightError("Length Invalid");
// 			}
// 			let k = keys[0];
// 			let v = values[0];
// 			checkCommand(k, v);
// 		}
// 	} catch (err) {
// 		if (err instanceof InsightError) {
// 			throw err;
// 		}
// 	}
// }
//
// // Checks MCOMPARISON
// export function isMComparisonValid(obj: object) {
// 	try {
// 		let keys = Object.keys(obj);
// 		let values = Object.values(obj);
// 		if (keys.length !== 1 || values.length !== 1) {
// 			throw new InsightError("Length Invalid");
// 		}
// 		// Check semantics for the key...
// 		checkKeys(keys[0], "number");
//
// 		// Check semantics of the value
// 		if (!(typeof values[0] === "number")) {
// 			throw new InsightError("Type Invalid");
// 		}
// 	} catch (err) {
// 		if (err instanceof InsightError) {
// 			throw err;
// 		}
// 	}
// }
//
// // Checks SCOMPARISON
// export function isSComparisonValid(obj: object) {
// 	try {
// 		// Check there's only one skey and input string
// 		let keys = Object.keys(obj);
// 		let values = Object.values(obj);
// 		if (keys.length !== 1 || values.length !== 1) {
// 			throw new InsightError("Length Invalid");
// 		}
// 		// Check semantics of the key
// 		checkKeys(keys[0], "string");
//
// 		// Check semantics of the value
// 		if (typeof values[0] !== "string") {
// 			throw new InsightError("Type Invalid");
// 		}
// 		// Check if input string is empty or only asterisk or only one character
// 		let value = values[0];
// 		let asteriskIdx = values[0].indexOf("*", 1);
//
// 		// Check inputstring has no asterisk inside
// 		if (value === undefined || !(asteriskIdx === -1 || asteriskIdx === value.length - 1)) {
// 			throw new InsightError("Values Invalid");
// 		}
// 	} catch (err) {
// 		if (err instanceof InsightError) {
// 			throw err;
// 		}
// 	}
// }
//
// // Checks NEGATION
// export function isNegationValid(obj: object) {
// 	try {
// 		// Check it has only one FILTER
// 		let keys = Object.keys(obj);
// 		if (keys.length === 0 || keys.length > 1) {
// 			throw new InsightError("Length Invalid");
// 		}
// 		// Figure out what FILTER it is and check it
// 		let k = keys[0];
// 		let values = Object.values(obj);
// 		let v = values[0];
// 		checkCommand(k, v);
// 	} catch (err) {
// 		if (err instanceof InsightError) {
// 			throw err;
// 		}
// 	}
// }
// // END BODY VALIDITY CHECK
//
// // BEGIN OPTIONS VALIDITY CHECK
// export function isOptionsValid(obj: object) {
// 	try {
// 		// Check if COLUMNS property is present
// 		if (!Object.prototype.hasOwnProperty.call(obj, "COLUMNS")) {
// 			throw new InsightError("Command Invalid");
// 		}
// 		// Check if COLUMNS keys are valid
// 		let values = Object.values(obj);
// 		isColumnsValid(values[0]);
// 		// Check if there is ORDER property and if it is valid
// 		if (Object.prototype.hasOwnProperty.call(obj, "ORDER")) {
// 			if (typeof values[1] !== "string") {
// 				throw new InsightError("Type Invalid");
// 			}
// 			isOrderValid(values[1], values[0]);
// 		}
// 	} catch (err) {
// 		if (err instanceof InsightError) {
// 			throw err;
// 		}
// 	}
// }
//
// export function isColumnsValid(list: string[]) {
// 	try {
// 		// Check if COLUMNS array is empty
// 		if (list.length === 0) {
// 			throw new InsightError("Length Invalid");
// 		}
// 		for (const key of list) {
// 			// Check if COLUMNS keys are valid
// 			checkKeys(key, "all");
// 		}
// 	} catch (err) {
// 		if (err instanceof InsightError) {
// 			throw err;
// 		}
// 	}
// }
//
// export function isOrderValid(orderKey: string, columnKeys: string[]) {
// 	try {
// 		if (!columnKeys.includes(orderKey)) {
// 			throw new InsightError("Order key Invalid");
// 		}
// 	} catch (err) {
// 		if (err instanceof InsightError) {
// 			throw err;
// 		}
// 	}
// }
// // END OPTIONS VALIDITY CHECK
//
// function checkID(inputID: string) {
// 	if (currentQuery === undefined) {
// 		// console.log("in");
// 		currentQuery = inputID;
// 	}
// 	if (inputID !== currentQuery) {
// 		throw new InsightError("multiple datasets");
// 	}
// }
//
// function checkCommand(key: string, value: any) {
// 	if (key === "AND" || key === "OR") {
// 		isLogicComparisonValid(value);
// 	} else if (key === "LT" || key === "GT" || key === "EQ") {
// 		isMComparisonValid(value);
// 	} else if (key === "IS") {
// 		isSComparisonValid(value);
// 	} else if (key === "NOT") {
// 		isNegationValid(value);
// 	} else {
// 		throw new InsightError("Command Invalid");
// 	}
// }
//
// function checkKeys(key: string, typeOfKey: string) {
// 	try {
// 		if (!key.includes("_")) {
// 			throw new InsightError("Query Keys Invalid");
// 		}
// 		let underscoreIdx = key.indexOf("_");
// 		let keyProperty = key.substring(underscoreIdx + 1);
// 		checkID(key.substring(0, underscoreIdx));
// 		if (typeOfKey === "string") {
// 			if (
// 				keyProperty !== "dept" &&
// 				keyProperty !== "id" &&
// 				keyProperty !== "instructor" &&
// 				keyProperty !== "title" &&
// 				keyProperty !== "uuid"
// 			) {
// 				throw new InsightError("Query Properties Invalid");
// 			}
// 		} else if (typeOfKey === "number") {
// 			if (
// 				keyProperty !== "avg" &&
// 				keyProperty !== "pass" &&
// 				keyProperty !== "fail" &&
// 				keyProperty !== "audit" &&
// 				keyProperty !== "year"
// 			) {
// 				throw new InsightError("Query Properties Invalid");
// 			}
// 		} else {
// 			if (
// 				keyProperty !== "dept" &&
// 				keyProperty !== "id" &&
// 				keyProperty !== "instructor" &&
// 				keyProperty !== "title" &&
// 				keyProperty !== "avg" &&
// 				keyProperty !== "pass" &&
// 				keyProperty !== "fail" &&
// 				keyProperty !== "audit" &&
// 				keyProperty !== "year" &&
// 				keyProperty !== "uuid"
// 			) {
// 				throw new InsightError("Query Properties Invalid");
// 			}
// 		}
// 	} catch (err) {
// 		if (err instanceof InsightError) {
// 			throw err;
// 		}
// 	}
// }
