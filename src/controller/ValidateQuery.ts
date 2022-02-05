import {InsightError} from "./IInsightFacade";

// type LOGIC = "AND" | "OR";
// type MCOMPARATOR = "LT" | "GT" | "EQ";
// type KEYS = "_dept" | "_id" | "_avg" | "_instructor" | "_title" | "_pass" | "_fail" | "_audit" | "_uuid" | "_year";

// PROBABLY ADD MORE PARAMETERS:
// will need to check all dataset ids are the same (no multiple ids)
// Will need a list of all the dataset ids added to check valid query keys

// MAIN
export function isQueryValid(query: object) {
	let hasWhere: boolean = Object.prototype.hasOwnProperty.call(query, "WHERE");
	let hasOptions: boolean = Object.prototype.hasOwnProperty.call(query, "OPTIONS");
	if (!hasWhere) {
		return new InsightError("Invalid query: No WHERE property found");
	}
	if (!hasOptions) {
		return new InsightError("Invalid query: No OPTIONS property found");
	}

	let keys = Object.keys(query);
	if (keys.length > 2) {
		return new InsightError("Invalid query: Has properties other than WHERE and OPTIONS");
	}
	if (keys[0] !== "WHERE" || keys[1] !== "OPTIONS") {
		return new InsightError("Invalid query: Incorrect placement of WHERE and/or OPTIONS");
	}
	// Check if ODY and OPTIONS are valid
	let values = Object.values(query);
	let bodyValid = isBodyValid(values[0]);
	let optionsValid = isOptionsValid(values[1]);
	if (!bodyValid) {
		return new InsightError("Body Invalid");
	}
	if (!optionsValid) {
		return new InsightError("Options Invalid");
	}
	return true;
}

// BEGIN BODY VALIDITY CHECK
// Checks body of query input
export function isBodyValid(obj: object): boolean {
	// Check number of filters; 0 or 1 filter is valid; >1 is invalid
	let keys = Object.keys(obj);
	if (keys.length === 0) {
		return true;
	}
	if (keys.length > 1) {
		return false;
	}
	// Check syntax and semantic of Logic, MComp, SComp, Neg
	let values = Object.values(obj);
	let k = keys[0];
	let v = values[0];
	if (k === "AND" || k === "OR") {
		return isLogicComparisonValid(v);
	} else if (k === "LT" || k === "GT" || k === "EQ") {
		return isMComparisonValid(v);
	} else if (k === "IS") {
		return isSComparisonValid(v);
	} else if (k === "NOT") {
		return isNegationValid(v);
	}
	return false;
}

// Checks LOGICCOMPARISON
export function isLogicComparisonValid(array: object[]): boolean {
	// Check if there is at least one FILTER in array
	if (array.length === 0) {
		return false;
	}
	// Loop through array checking if valid filters
	for (const obj of array) {
		let keys = Object.keys(obj);
		let values = Object.values(obj);
		// Check there's only one key and value
		if (keys.length !== 1 || values.length !== 1) {
			return false;
		}
		let k = keys[0];
		let v = values[0];
		if (k === "AND" || k === "OR") {
			if (!isLogicComparisonValid(v)) {
				return false;
			}
		} else if (k === "LT" || k === "GT" || k === "EQ") {
			if (!isMComparisonValid(v)) {
				return false;
			}
		} else if (k === "IS") {
			if (!isSComparisonValid(v)) {
				return false;
			}
		} else if (k === "NOT") {
			if (!isNegationValid(v)) {
				return false;
			}
		} else {
			return false;
		}
	}
	return true;
}

// Checks MCOMPARISON
export function isMComparisonValid(obj: object): boolean {
	let keys = Object.keys(obj);
	let values = Object.values(obj);
	if (keys.length !== 1 || values.length !== 1) {
		return false;
	}
	// TODO: Check semantics for the key and value
	return true;
}

// Checks SCOMPARISON
export function isSComparisonValid(obj: object): boolean {
	// Check there's only one skey and input string
	let keys = Object.keys(obj);
	let values = Object.values(obj);
	if (keys.length !== 1 || values.length !== 1) {
		return false;
	}
	// TODO: Check semantics of the key and value
	return true;
}

// Checks NEGATION
export function isNegationValid(obj: object): boolean {
	// Check it has only one FILTER
	let keys = Object.keys(obj);
	if (keys.length === 0 || keys.length > 1) {
		return false;
	}
	// Figure out what FILTER it is and check it
	let k = keys[0];
	let values = Object.values(obj);
	let v = values[0];
	if (k === "AND" || k === "OR") {
		return isLogicComparisonValid(v);
	} else if (k === "LT" || k === "GT" || k === "EQ") {
		return isMComparisonValid(v);
	} else if (k === "IS") {
		return isSComparisonValid(v);
	} else if (k === "NOT") {
		return isNegationValid(v);
	}
	return false;
}
// END BODY VALIDITY CHECK


// BEGIN OPTIONS VALIDITY CHECK
export function isOptionsValid(obj: object): boolean {
	// Check if COLUMNS property is present
	let hasColumns = Object.prototype.hasOwnProperty.call(obj, "COLUMNS");
	if (!hasColumns) {
		return false;
	}
	// Check if COLUMNS keys are valid
	let values = Object.values(obj);
	let columnsValid = isColumnsValid(values[0]);
	if (!columnsValid) {
		return false;
	}
	// Check if there is ORDER property and if it is valid
	let hasOrder = Object.prototype.hasOwnProperty.call(obj, "ORDER");
	if (hasOrder) {
		return isOrderValid(values[1], values[0]);
	}
	return true;
}

export function isColumnsValid(list: string[]): boolean {
	// Check if COLUMNS array is empty
	if (list.length === 0) {
		return false;
	}

	// TODO: semantic check needed for keys
	return true;
}

export function isOrderValid(key: string, keys: string[]): boolean {
	for (const k of keys) {
		if (k === key) {
			return true;
		}
	}
	return false;
}
// END OPTIONS VALIDITY CHECK

// export function validCheckDecisionHelper(key: string, value: any): boolean {
// 	if (key === "AND" || key === "OR") {
// 		return isLogicComparisonValid(value);
// 	} else if (key === "LT" || key === "GT" || key === "EQ") {
// 		return isMComparisonValid(value);
// 	} else if (key === "IS") {
// 		return isSComparisonValid(value);
// 	} else if (key === "NOT") {
// 		return isNegationValid(value);
// 	}
// 	return false;
// }
