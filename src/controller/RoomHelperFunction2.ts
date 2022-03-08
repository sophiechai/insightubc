function searchTreeByTag(element: object, matchingTag: string): object {
	// html -> body -> div -> div -> div -> section -> div -> div -> table
	let keys = Object.keys(element);
	let values = Object.values(element);

	if (!keys.includes("tagName")) {
		// console.log("skip " + values[keys.indexOf("nodeName")]);
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
	// console.log("inside searchTreeByID method");
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

export {searchTreeByID, searchTreeByTag};