export class Rooms {
	public get map(): Map<string, number | string> {
		return this._map;
	}

	public set map(value: Map<string, number | string>) {
		this._map = value;
	}

	private _map: Map<string, number | string>;

	public constructor(jsonStringInput: string) {
		this._map = new Map<string, number | string>();
	}
}
