import {InsightError} from "./IInsightFacade";

export abstract class ValidateQueryMain {
	protected readonly query: object;
	protected currentQuery: string;
	protected applyKeys: string[];
	protected groupKeys: string[];
	protected hasTransformations: boolean;

	protected constructor(query: object) {
		this.query = query;
		this.currentQuery = "";
		this.applyKeys = [];
		this.groupKeys = [];
		this.hasTransformations = false;
	}

	public isQueryValid(): string {
		this.checkHasWhereAndOptions();

		this.hasTransformations = Object.prototype.hasOwnProperty.call(this.query, "TRANSFORMATIONS");
		let keys = Object.keys(this.query);
		this.checkLength(keys.length, this.hasTransformations);
		this.checkOrderOfWhereOptionsTransform(keys);

		let values = Object.values(this.query);

		if (this.hasTransformations) {
			this.isTransformationsValid(values[2]);
		}
		this.isBodyValid(values[0]);
		this.isOptionsValid(values[1]);
		return this.currentQuery;
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
		this.checkKeys(keys[0], "number");

		if (!(typeof values[0] === "number")) {
			throw new InsightError("Type Invalid");
		}
	}

	private isSComparisonValid(obj: object) {
		let keys = Object.keys(obj);
		let values = Object.values(obj);
		if (keys.length !== 1 || values.length !== 1) {
			throw new InsightError("Length Invalid");
		}
		this.checkKeys(keys[0], "string");

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
		let keys = Object.keys(obj);
		if (keys.length === 0 || keys.length > 1) {
			throw new InsightError("Length Invalid");
		}
		let k = keys[0];
		let values = Object.values(obj);
		let v = values[0];
		this.checkCommand(k, v);
	}

	private isOptionsValid(obj: object) {
		if (!Object.prototype.hasOwnProperty.call(obj, "COLUMNS")) {
			throw new InsightError("Missing COLUMNS");
		}
		let values = Object.values(obj);
		this.isColumnsValid(values[0]);

		if (Object.prototype.hasOwnProperty.call(obj, "ORDER")) {
			if (typeof values[1] !== "string") {
				throw new InsightError("Type Invalid");
			}
			this.isOrderValid(values[1], values[0]);
		}
	}

	private isColumnsValid(list: string[]) {
		if (list.length === 0) {
			throw new InsightError("COLUMNS requires at least one key");
		}
		if (this.hasTransformations) {
			for (const key in list) {
				if (!this.groupKeys.includes(key) && !this.applyKeys.includes(key)) {
					throw new InsightError("COLUMN key " + key + " is not in GROUP or APPLY");
				}
			}
		} else {
			for (const key of list) {
				this.checkKeys(key, "all");
			}
		}
	}

	private isOrderValid(orderKey: string, columnKeys: string[]) {
		if (!columnKeys.includes(orderKey)) {
			throw new InsightError("Order key Invalid");
		}
	}

	private checkID(inputID: string) {
		if (this.currentQuery === "") {
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

	private isTransformationsValid(obj: object) {
		let keys = Object.keys(obj);
		let values = Object.values(obj);

		if (keys.length !== 2 || keys[0] !== "GROUP" || keys[1] !== "APPLY") {
			throw new InsightError("Must have only GROUP and APPLY in TRANSFORMATIONS");
		}

		if (!Array.isArray(values[0])) {
			throw new InsightError("GROUP value is not an array");
		}
		this.checkGroup(values[0]);

		if (!Array.isArray(values[1])) {
			throw new InsightError("APPLY value is not an array");
		}
		this.checkApply(values[1]);
	}

	private checkGroup(groupArray: string[]) {
		if (groupArray.length === 0) {
			throw new InsightError("GROUP needs at least one key");
		}
		for (const key of groupArray) {
			this.checkKeys(key, "any");
			this.groupKeys.push(key);
		}
	}

	// INPUT: [ (APPLYRULE (, APPLYRULE )* )? ]
	private checkApply(applyArray: object[]) {
		// applyRule: { applykey : { APPLYTOKEN : key }}
		for (const applyRule of applyArray) {
			let ruleKeys = Object.keys(applyRule);
			let ruleValues = Object.values(applyRule);
			if (ruleKeys.length !== 1) {
				throw new InsightError("APPLYRULE should have 1 key applykey but has " + ruleKeys.length);
			}
			this.checkApplyKey(ruleKeys[0]);
			this.checkApplyRuleValue(ruleValues[0]);
		}
	}

	private checkApplyKey(applyKey: string) {
		if (applyKey === "" || applyKey.includes("_")) {
			throw new InsightError(applyKey + " is an invalid applykey");
		}
		if (this.applyKeys.includes(applyKey)) {
			throw new InsightError("Duplicate applykey: " + applyKey);
		}
		this.applyKeys.push(applyKey);
	}

	// INPUT: { APPLYTOKEN : key }
	private checkApplyRuleValue(applyRuleValue: object) {
		let applyTokens = Object.keys(applyRuleValue);
		if (applyTokens.length !== 1) {
			throw new InsightError("applykey should have 1 APPLYTOKEN but has " + applyTokens.length);
		}
		let tokenType: string = this.getTokenType(applyTokens[0]);
		let applyTokenValues: string[] = Object.values(applyRuleValue);
		this.checkKeys(applyTokenValues[0], tokenType);
	}

	private getTokenType(token: string) {
		switch (token) {
			case "MAX": case "MIN": case "AVG": case "SUM":
				return "number";
			case "COUNT":
				return "any";
			default:
				throw new InsightError(token + " is not a valid APPLYTOKEN");
		}
	}
}
