function searchTreeByTag(element: object, matchingTag: string): object {
	// html -> body -> div -> div -> div -> section -> div -> div -> table
	let keys = Object.keys(element);
	let values = Object.values(element);

	if (!keys.includes("tagName")) {
		return null as any;
	}

	let childNodeIndex = keys.indexOf("childNodes");
	if (values[keys.indexOf("tagName")] === matchingTag) {
		// console.log("found matching title");
		return element;
	} else if (values[childNodeIndex].length > 0) {
		// console.log("inside " + values[keys.indexOf("tagName")]);
		let i;
		let result: object = null as any;
		for (i = 0; result === null && i < values[childNodeIndex].length; i++) {
			result = searchTreeByTag(values[childNodeIndex][i], matchingTag);
		}
		return result;
	}
	return null as any;
}

function searchTreeByID(element: object, matchingID: string): object {
	let keys = Object.keys(element);
	let values = Object.values(element);
	if (!keys.includes("attrs")) {
		// console.log("skip " + values[keys.indexOf("nodeName")]);
		return null as any;
	}
	let childNodeIndex = keys.indexOf("childNodes");
	let attrArray = values[keys.indexOf("attrs")];
	for (const item of attrArray) {
		let keysAttr = Object.keys(item);
		let valuesAttr = Object.values(item);
		if (valuesAttr[keysAttr.indexOf("name")] === "id" && valuesAttr[keysAttr.indexOf("value")] === matchingID) {
			// console.log("found matching " + matchingID);
			return element;
		}
	}
	if (values[childNodeIndex].length > 0) {
		// console.log("inside " + values[keys.indexOf("tagName")]);
		let result: object = null as any;
		for (let i = 0; result === null && i < values[childNodeIndex].length; i++) {
			result = searchTreeByID(values[childNodeIndex][i], matchingID);
		}
		return result;
	}
	return null as any;
}

function convertToJSON(
	roomInfoList: Map<string, string[][]>,
	buildingInfoArray: Map<string, Array<string|object>>,
	tempList: object[]) {

	for(const [key, value] of roomInfoList) {
		let buildingInfo = buildingInfoArray.get(key);

		if (buildingInfo === undefined) {
			console.log("building info is undefined");
		} else {
			for (const [index, room] of value.entries()) {
				let roomJSON: object = {
					fullName: buildingInfo[1],
					shortName: buildingInfo[0],
					number: room[1],
					name: buildingInfo[0] + "_" + room[1],
					address: buildingInfo[2],
					lat: buildingInfo[4],
					lon: buildingInfo[5],
					seats: Number(room[2]),
					type: room[4],
					furniture: room[3],
					href: room[0],
				};
				tempList.push(roomJSON);
			}
		}
	}
	return tempList;
}
export {searchTreeByID, searchTreeByTag, convertToJSON};
