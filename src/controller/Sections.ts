import {Dataset} from "./Datasets";

export class Sections extends Dataset {

	public constructor(jsonStringInput: string) {
		super();

		let keys: string[] = Object.keys(jsonStringInput);
		let values: Array<string | number> = Object.values(jsonStringInput);
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i].toLowerCase();
			if (key === "subject") {
				key = "dept";
			} else if (key === "id") {
				key = "uuid";
			} else if (key === "professor") {
				key = "instructor";
			} else if (key === "course") {
				key = "id";
			}
			this.map.set(key, values[i]);
		}
	}
}
