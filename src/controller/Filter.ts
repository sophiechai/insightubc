// Need to pass in the array of data as a parameter to filter()...

let data: object[];

// TRUST THE NATURAL RECURSION...
export function filter(instruction: object, dataArray: object[]): object[] {
	data = dataArray;
	let result: object[] = [];
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let v = values[0];
	console.log("THIS IS THE KEYS: ", keys);
	console.log("THIS IS THE KEY: ", keys[0]);
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
		default:
			console.log("UNEXPECTED CASE");
	}
	return result;
}

export function filterGT(instruction: object): object[] {
	let result: object[] = [];
	let keys = Object.keys(instruction);
	let values = Object.values(instruction);
	let k = keys[0];
	let v = values[0];
	// TODO: get the substring for what specific section I need to compare
	// TODO: get the correct corresponding string for that section in raw data
	for (const d of data) {
		// TODO: get value of that section of the raw data
		// TODO: compare and place in result[] if meets requirement
	}
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
