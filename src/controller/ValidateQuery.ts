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
export function isBodyValid(obj: object) {
	// Check number of filters; 0 or 1 filter is valid; >1 is invalid
	let keys = Object.keys(obj);
	if (keys.length === 0) {
		return true;
	}
	if (keys.length > 1) {
		return new InsightError("Too many FILTER");
	}
	// Check syntax and semantic of Logic, MComp, SComp, Neg
	let logicValid: boolean;
	let mCompValid: boolean;
	let sCompValid: boolean;
	let negationValid: boolean;
	let values = Object.values(obj);
	let k = keys[0];
	let v = values[0];
	if (k === "AND" || k === "OR") {
		logicValid = isLogicComparisonValid(v);
		if (logicValid) {
			return true;
		}
	} else if (k === "LT" || k === "GT" || k === "EQ") {
		mCompValid = isMComparisonValid(v);
		if (mCompValid) {
			return true;
		}
	} else if (k === "IS") {
		sCompValid = isSComparisonValid(v);
		if (sCompValid) {
			return true;
		}
	} else if (k === "NOT") {
		negationValid = isNegationValid(v);
		if (negationValid) {
			return true;
		}
	}
	return new InsightError("No valid FILTER");
}

// Checks LOGICCOMPARISON
export function isLogicComparisonValid(obj: object): boolean {
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

