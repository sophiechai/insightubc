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
		if (keys[0] !== "WHERE" || keys[1] !== "OPTIONS") {
			throw new InsightError("Incorrect placement of WHERE, OPTIONS, and/or TRANSFORMATIONS");
		}
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

	private isBodyValid(obj: object): void {
		let keys = Object.keys(obj);
		if (keys.length === 0) {
			return;
		}
		if (keys.length > 1) {
			throw new InsightError("Length Invalid");
		}
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
		for (const obj of array) {
			let keys = Object.keys(obj);
			let values = Object.values(obj);
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
		let value = values[0];
		let asteriskIdx = values[0].indexOf("*", 1);
		if (value === undefined || !(asteriskIdx === -1 || asteriskIdx === value.length - 1)) {
			throw new InsightError("Values Invalid");
		}
	}

	private isNegationValid(obj: object) {
		let keys = Object.keys(obj);
		if (keys.length === 0 || keys.length > 1) {
			throw new InsightError("Length Invalid");
		}
		let values = Object.values(obj);
		this.checkCommand(keys[0], values[0]);
	}

	private isOptionsValid(obj: object) {
		if (!Object.prototype.hasOwnProperty.call(obj, "COLUMNS")) {
			throw new InsightError("Missing COLUMNS");
		}
		let values = Object.values(obj);
		this.isColumnsValid(values[0]);

		if (Object.prototype.hasOwnProperty.call(obj, "ORDER")) {
			this.isOrderValid(values[1], values[0], typeof values[1]);
		}
	}

	private isColumnsValid(list: string[]) {
		if (list.length === 0) {
			throw new InsightError("COLUMNS requires at least one key");
		}
		if (this.hasTransformations) {
			for (const key of list) {
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

	private isOrderValid(orderValue: any, columnKeys: string[], type: string) {
		if (type === "object") {
			let dirAndKeysKey = Object.keys(orderValue);
			let dirAndKeysValues: any = Object.values(orderValue);
			if (dirAndKeysKey.length !== 2 &&
				dirAndKeysKey[0] !== "dir" &&
				dirAndKeysKey[1] !== "keys" &&
				typeof dirAndKeysValues[0] !== "string" &&
				!Array.isArray(dirAndKeysValues[1])) {
				throw new InsightError("ORDER value invalid");
			}
			this.checkDirectionAndKeys(dirAndKeysValues[0], dirAndKeysValues[1], columnKeys);
		} else if (type === "string") {
			if (!columnKeys.includes(orderValue)) {
				throw new InsightError("ORDER key Invalid");
			}
		} else {
			console.log("UNEXPECTED TYPE FOR ORDER VALUE");
		}
	}

	private checkDirectionAndKeys(dirValue: string, keysValue: string[], columnsKeys: string[]) {
		if (dirValue !== "UP" && dirValue !== "DOWN") {
			throw new InsightError("Invalid DIRECTION");
		}
		if (keysValue.length === 0) {
			throw new InsightError("Requires at least one key to SORT");
		}
		for (const key of keysValue) {
			if (!columnsKeys.includes(key)) {
				throw new InsightError("SORT key " + key + " is not in COLUMNS");
			}
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

	private checkApply(applyArray: object[]) {
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
			case "MAX":
			case "MIN":
			case "AVG":
			case "SUM":
				return "number";
			case "COUNT":
				return "any";
			default:
				throw new InsightError(token + " is not a valid APPLYTOKEN");
		}
	}
}
