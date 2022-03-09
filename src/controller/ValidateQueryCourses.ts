import {ValidateQueryMain} from "./ValidateQueryMain";
import {InsightError} from "./IInsightFacade";

export class ValidateQueryCourses extends ValidateQueryMain {
	constructor(query: object) {
		super(query);
	}

	protected checkKeyProperty(typeOfKey: string, keyProperty: string) {
		if (typeOfKey === "string") {
			if (
				keyProperty !== "dept" &&
				keyProperty !== "id" &&
				keyProperty !== "instructor" &&
				keyProperty !== "title" &&
				keyProperty !== "uuid"
			) {
				throw new InsightError("Query Properties Invalid");
			}
		} else if (typeOfKey === "number") {
			if (
				keyProperty !== "avg" &&
				keyProperty !== "pass" &&
				keyProperty !== "fail" &&
				keyProperty !== "audit" &&
				keyProperty !== "year"
			) {
				throw new InsightError("Query Properties Invalid");
			}
		} else {
			if (
				keyProperty !== "dept" &&
				keyProperty !== "id" &&
				keyProperty !== "instructor" &&
				keyProperty !== "title" &&
				keyProperty !== "avg" &&
				keyProperty !== "pass" &&
				keyProperty !== "fail" &&
				keyProperty !== "audit" &&
				keyProperty !== "year" &&
				keyProperty !== "uuid"
			) {
				throw new InsightError("Query Properties Invalid");
			}
		}
	}
}
