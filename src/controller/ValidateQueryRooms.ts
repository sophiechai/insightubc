import {ValidateQueryMain} from "./ValidateQueryMain";
import {InsightError} from "./IInsightFacade";

export class ValidateQueryRooms extends ValidateQueryMain {
	constructor(query: object) {
		super(query);
	}

	protected checkKeyProperty(typeOfKey: string, keyProperty: string) {
		if (typeOfKey === "string") {
			if (
				keyProperty !== "fullname" &&
				keyProperty !== "shortname" &&
				keyProperty !== "number" &&
				keyProperty !== "name" &&
				keyProperty !== "address" &&
				keyProperty !== "type" &&
				keyProperty !== "furniture" &&
				keyProperty !== "href"
			) {
				throw new InsightError("Query Properties Invalid");
			}
		} else if (typeOfKey === "number") {
			if (keyProperty !== "lat" && keyProperty !== "lon" && keyProperty !== "seats") {
				throw new InsightError("Query Properties Invalid");
			}
		} else {
			if (
				keyProperty !== "fullname" &&
				keyProperty !== "shortname" &&
				keyProperty !== "number" &&
				keyProperty !== "name" &&
				keyProperty !== "address" &&
				keyProperty !== "type" &&
				keyProperty !== "furniture" &&
				keyProperty !== "href" &&
				keyProperty !== "lat" &&
				keyProperty !== "lon" &&
				keyProperty !== "seats"
			) {
				throw new InsightError("Query Properties Invalid");
			}
		}
	}
}
