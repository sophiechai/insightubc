export class Dataset {
	public get map(): Map<string, number | string> {
		return this._map;
	}

	public set map(value: Map<string, number | string>) {
		this._map = value;
	}

	protected _map: Map<string, number | string>;

	public constructor() {
		this._map = new Map<string, number | string>();
	}
}
