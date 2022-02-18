export class Sections {
	public get flag(): number {
		return this._flag;
	}

	public set flag(value: number) {
		this._flag = value;
	}
	public get map(): Map<string, number | string> {
		return this._map;
	}

	public set map(value: Map<string, number | string>) {
		this._map = value;
	}
	private _flag: number;
	private _map: Map<string, number | string>;
	public constructor(jsonStringInput: string) {
		this._flag = 0;
		this._map = new Map<string, number | string>();

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
			this._map.set(key, values[i]);
		}
	}
}
