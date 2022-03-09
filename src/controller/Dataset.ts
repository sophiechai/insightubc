export class Dataset {
	public get map(): Map<string, number | string> {
		return this._map;
	}

	public set map(value: Map<string, number | string>) {
		this._map = value;
	}

	protected _map: Map<string, number | string>;

	public constructor(jsonStringInput: string) {
		this._map = new Map<string, number | string>();

// 		let keys: string[] = Object.keys(jsonStringInput);
// 		let values: Array<string | number> = Object.values(jsonStringInput);
// 		for (let i = 0; i < keys.length; i++) {
// 			let key = keys[i].toLowerCase();
// 			this._map.set(key, values[i]);
// 		}

	}
}
