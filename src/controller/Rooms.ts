import {Dataset} from "./Datasets";

export class Rooms extends Dataset {

	public constructor(jsonStringInput: string) {
		super();
		let keys: string[] = Object.keys(jsonStringInput);
		let values: Array<string | number> = Object.values(jsonStringInput);
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i].toLowerCase();
			this.map.set(key, values[i]);
		}
	}
}
