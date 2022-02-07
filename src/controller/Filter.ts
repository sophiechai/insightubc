

export function filter(instruction: object): object[] {
	let result: object[] = [];
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let v = values[0];
	console.log("THIS IS THE KEYS: ", keys, " AND THE KEY: ", keys[0]);
	switch (keys[0]) {
		case "GT":
			filterGT(v);
			break;
		case "LT":
			filterLT(v);
			break;
		case "EQ":
			filterEQ(v);
			break;
		case "IS":
			filterIS(v);
			break;
		case "AND":
			filterAND(v);
			break;
		case "OR":
			filterOR(v);
			break;
		case "NOT":
			filterNOT(v);
			break;
	}
	return result;
}


export function filterGT(instruction: object): object[] {
	let result: object[] = [];
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v = values[0];
	return [];
}

export function filterLT(instruction: object): object[] {
	let result: object[] = [];
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v = values[0];
	return result;
}

export function filterEQ(instruction: object): object[] {
	let result: object[] = [];
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v = values[0];
	return result;
}

export function filterIS(instruction: object): object[] {
	let result: object[] = [];
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v = values[0];
	return result;
}

export function filterAND(instruction: object): object[] {
	let result: object[] = [];
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v = values[0];
	return result;
}

export function filterOR(instruction: object): object[] {
	let result: object[] = [];
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v = values[0];
	return result;
}

export function filterNOT(instruction: object): object[] {
	let result: object[] = [];
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v = values[0];
	return result;
}
