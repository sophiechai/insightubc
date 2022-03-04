import {InsightError} from "./IInsightFacade";

export abstract class ValidateQueryMain {
	protected currentQuery: string | undefined;
	protected readonly query: object;

	protected constructor(query: object) {
		this.query = query;
	}

	public isQueryValid(): string {
		this.checkHasWhereAndOptions();

		let hasTransformations: boolean = Object.prototype.hasOwnProperty.call(this.query, "TRANSFORMATIONS");
		let keys = Object.keys(this.query);
		this.checkLength(keys.length, hasTransformations);
		this.checkOrderOfWhereOptionsTransform(keys);

		let values = Object.values(this.query);

		// TODO: TRANSFORMATIONS CHECK FIRST (to store apply keys in a global? to check COLUMNS later)
		if (hasTransformations) {
			this.isTransformationsValid();
		}
		this.isBodyValid(values[0]);
		this.isOptionsValid(values[1]);
		return this.currentQuery ? this.currentQuery : "";
	}

	private checkHasWhereAndOptions() {
		let hasWhere: boolean = Object.prototype.hasOwnProperty.call(this.query, "WHERE");
		let hasOptions: boolean = Object.prototype.hasOwnProperty.call(this.query, "OPTIONS");
		if (!hasWhere) {
			throw new InsightError("No WHERE property found");
		}
		if (!hasOptions) {
			throw new InsightError("No OPTIONS property found");
		}
	}

	private checkLength(length: number, hasTransformations: boolean) {
		if (hasTransformations && length !== 3) {
			throw new InsightError("Has properties other than WHERE, OPTIONS, and TRANSFORMATIONS");
		}
		if (!hasTransformations && length !== 2) {
			throw new InsightError("Has properties other than WHERE, OPTIONS, and TRANSFORMATIONS");
		}
	}

	private checkOrderOfWhereOptionsTransform(keys: string[]) {
		if (keys[0] !== "WHERE" || keys[1] !== "OPTIONS") {
			throw new InsightError("Incorrect placement of WHERE, OPTIONS, and/or TRANSFORMATIONS");
		}
	}

	private isBodyValid(obj: object): void {
		// Check number of filters; 0 or 1 filter is valid; >1 is invalid
		let keys = Object.keys(obj);
		if (keys.length === 0) {
			return;
		}
		if (keys.length > 1) {
			throw new InsightError("Length Invalid");
		}
		// Check syntax and semantic of Logic, MComp, SComp, Neg
		let values = Object.values(obj);
		let k = keys[0];
		let v = values[0];
		this.checkCommand(k, v);
	}

	private isLogicComparisonValid(array: object[]) {
		// Check if there is at least one FILTER in array
		if (array.length === 0) {
			throw new InsightError("Length Invalid");
		}
		if (!Array.isArray(array)) {
			throw new InsightError("Must be an array");
		}
		// Loop through array checking if valid filters
		for (const obj of array) {
			let keys = Object.keys(obj);
			let values = Object.values(obj);
			// Check there's only one key and value
			// console.log(typeof values[0]);
			if (keys.length !== 1 || values.length !== 1) {
				throw new InsightError("Length Invalid");
			}
			let k = keys[0];
			let v = values[0];
			this.checkCommand(k, v);
		}
	}

	private isMComparisonValid(obj: object) {
		let keys = Object.keys(obj);
		let values = Object.values(obj);
		if (keys.length !== 1 || values.length !== 1) {
			throw new InsightError("Length Invalid");
		}
		// Check semantics for the key...
		this.checkKeys(keys[0], "number");

		// Check semantics of the value
		if (!(typeof values[0] === "number")) {
			throw new InsightError("Type Invalid");
		}
	}

	private isSComparisonValid(obj: object) {
		// Check there's only one skey and input string
		let keys = Object.keys(obj);
		let values = Object.values(obj);
		if (keys.length !== 1 || values.length !== 1) {
			throw new InsightError("Length Invalid");
		}
		// Check semantics of the key
		this.checkKeys(keys[0], "string");

		// Check semantics of the value
		if (typeof values[0] !== "string") {
			throw new InsightError("Type Invalid");
		}
		// Check if input string is empty or only asterisk or only one character
		let value = values[0];
		let asteriskIdx = values[0].indexOf("*", 1);

		// Check inputstring has no asterisk inside
		if (value === undefined || !(asteriskIdx === -1 || asteriskIdx === value.length - 1)) {
			throw new InsightError("Values Invalid");
		}
	}

	private isNegationValid(obj: object) {
		// Check it has only one FILTER
		let keys = Object.keys(obj);
		if (keys.length === 0 || keys.length > 1) {
			throw new InsightError("Length Invalid");
		}
		// Figure out what FILTER it is and check it
		let k = keys[0];
		let values = Object.values(obj);
		let v = values[0];
		this.checkCommand(k, v);
	}

	private isOptionsValid(obj: object) {
		// Check if COLUMNS property is present
		if (!Object.prototype.hasOwnProperty.call(obj, "COLUMNS")) {
			throw new InsightError("Command Invalid");
		}
		// Check if COLUMNS keys are valid
		let values = Object.values(obj);
		this.isColumnsValid(values[0]);
		// Check if there is ORDER property and if it is valid
		if (Object.prototype.hasOwnProperty.call(obj, "ORDER")) {
			if (typeof values[1] !== "string") {
				throw new InsightError("Type Invalid");
			}
			this.isOrderValid(values[1], values[0]);
		}
	}

	private isColumnsValid(list: string[]) {
		// Check if COLUMNS array is empty
		if (list.length === 0) {
			throw new InsightError("Length Invalid");
		}
		for (const key of list) {
			// Check if COLUMNS keys are valid
			this.checkKeys(key, "all");
		}
	}

	private isOrderValid(orderKey: string, columnKeys: string[]) {
		if (!columnKeys.includes(orderKey)) {
			throw new InsightError("Order key Invalid");
		}
	}

	private checkID(inputID: string) {
		if (this.currentQuery === undefined) {
			// console.log("in");
			this.currentQuery = inputID;
		}
		if (inputID !== this.currentQuery) {
			throw new InsightError("multiple datasets");
		}
	}

	private checkCommand(key: string, value: any) {
		if (key === "AND" || key === "OR") {
			this.isLogicComparisonValid(value);
		} else if (key === "LT" || key === "GT" || key === "EQ") {
			this.isMComparisonValid(value);
		} else if (key === "IS") {
			this.isSComparisonValid(value);
		} else if (key === "NOT") {
			this.isNegationValid(value);
		} else {
			throw new InsightError("Command Invalid");
		}
	}

	private checkKeys(key: string, typeOfKey: string): void {
		if (!key.includes("_")) {
			throw new InsightError("Query Keys Invalid");
		}
		let underscoreIdx = key.indexOf("_");
		let keyProperty = key.substring(underscoreIdx + 1);
		this.checkID(key.substring(0, underscoreIdx));
		this.checkKeyProperty(typeOfKey, keyProperty);
	}

	protected abstract checkKeyProperty(typeOfKey: string, keyProperty: string): void;

	private isTransformationsValid() {
		// TODO: Implement this
	}
}
