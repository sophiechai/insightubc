import {Dataset} from "./Datasets";
import {getProperty, aggregate, applyGroup} from "./Filter";

export function applyTransformation(
	instruction: object,
	columnKeys: string[],
	newMap: Map<string, Dataset[]>,
	aggregateMap: Map<string, Map<string, number>>
) {
	// GROUP
	newMap = new Map(applyGroup(Object.values(instruction)[0], newMap));
	// APPLY
	// aggregateMap stores the transformation under APPLY
	if (Object.keys(instruction).length === 2) {
		applyApply(Object.values(instruction)[1], newMap, columnKeys, aggregateMap);
	}
	return newMap;
}

function applyApply(
	applyArray: object[],
	newMap: Map<string, Dataset[]>,
	columnKeys: string[],
	aggregateMap: Map<string, Map<string, number>>
) {
	for (const item of applyArray) {
		let applyKey: string = Object.keys(item)[0];
		if (columnKeys.includes(applyKey)) {
			let value = Object.values(item)[0];
			let command: string = Object.keys(value)[0];
			let commandValue = Object.values(value)[0];
			let property: string = "";
			if (typeof commandValue === "string") {
				property = getProperty(commandValue);
			}
			aggregate(command, newMap, property, applyKey, aggregateMap);
		}
	}
}
