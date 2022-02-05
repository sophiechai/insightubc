import {InsightError} from "./IInsightFacade";

type LOGIC = "AND" | "OR";
type MCOMPARATOR = "LT" | "GT" | "EQ";
type KEYS = "_dept" | "_id" | "_avg" | "_instructor" | "_title" | "_pass" | "_fail" | "_audit" | "_uuid" | "_year";

let datasetId: string; // store the dataset id to query
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

	let values = Object.values(query);
	let bodyValid = isBodyValid(values[0]);
	let optionsValid = isOptionsValid(values[1]);

	if (bodyValid && optionsValid) {
		return true;
	}
	return new InsightError("Should not have gotten here");
}

// BEGIN BODY VALIDITY CHECK
// Checks body of query input
export function isBodyValid(obj: object) {
	return true;
}

// Checks LOGICCOMPARISON
export function isLogicComparisonValid(obj: object) {
	return;
}

// Checks MCOMPARISON
export function isMComparisonValid(obj: object) {
	return;
}

// Checks SCOMPARISON
export function isSComparisonValid(obj: object) {
	return;
}

// Checks NEGATION
export function isNegationValid(obj: object) {
	return;
}
// END BODY VALIDITY CHECK


// BEGIN OPTIONS VALIDITY CHECK
export function isOptionsValid(obj: object) {
	// Check if COLUMNS property is present
	let hasColumns = Object.prototype.hasOwnProperty.call(obj, "COLUMNS");
	if (!hasColumns) {
		return new InsightError("Missing COLUMNS");
	}
	// Check if COLUMNS keys are valid
	let values = Object.values(obj);
	let columnsValid = isColumnsValid(values[0]);
	if (!columnsValid) {
		return new InsightError("Invalid COLUMNS");
	}
	// Check if there is ORDER property and if it is valid
	let hasOrder = Object.prototype.hasOwnProperty.call(obj, "ORDER");
	if (hasOrder) {
		if (!isOrderValid(values[1], values[0])) {
			return new InsightError("Invalid ORDER");
		}
	}
	return true;
}

export function isColumnsValid(list: string[]) {
	// Check if COLUMNS array is empty
	if (list.length === 0) {
		return false;
	}

	// TODO: semantic check needed for keys
	return true;
}

export function isOrderValid(key: string, keys: string[]) {
	for (const k of keys) {
		if (k === key) {
			return true;
		}
	}
	return false;
}
// END OPTIONS VALIDITY CHECK
