import JSZip, {JSZipObject} from "jszip";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import parse5 from "parse5";

// let dataPath = __dirname + "/../../data";

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
		console.log("found matching title");
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
		if ( valuesAttr[keysAttr.indexOf("name")] === "id" && valuesAttr[keysAttr.indexOf("value")] === matchingID) {
			console.log("found matching " + matchingID);
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

function parseTable(table: object, codeArray: string[]) {
	let tableKeys = Object.keys(table);
	let tableValues = Object.values(table);
	let tbody: object = tableValues[tableKeys.indexOf("childNodes")][3];

	let tbodyKeys = Object.keys(tbody);
	let tbodyValues = Object.values(tbody);
	let tbodyChildNodes = tbodyValues[tbodyKeys.indexOf("childNodes")];
	for (let i = 1; i < tbodyChildNodes.length - 1; i = i + 2) {
		let tr: object = tbodyChildNodes[i];
		let trKeys = Object.keys(tr);
		let trValues = Object.values(tr);
		let td: object = trValues[trKeys.indexOf("childNodes")][3];
		let tdKeys = Object.keys(td);
		let tdValues = Object.values(td);
		let value: object = tdValues[tdKeys.indexOf("childNodes")][0];
		let valueKeys = Object.keys(value);
		let valueValues = Object.values(value);
		let text: string = valueValues[valueKeys.indexOf("value")];
		codeArray.push(text.replace(/[^A-Z]/g, ""));
	}
}

function parseTableRooms(table: object, roomsJSONArray: object[], buildingInfoArray: string[]) {
	let roomInfoList: string[];
	let tableKeys = Object.keys(table);
	let tableValues = Object.values(table);
	let tbody: object = tableValues[tableKeys.indexOf("childNodes")][3];

	let tbodyKeys = Object.keys(tbody);
	let tbodyValues = Object.values(tbody);
	let tbodyChildNodes = tbodyValues[tbodyKeys.indexOf("childNodes")];
	for (let i = 1; i < tbodyChildNodes.length - 1; i = i + 2) {
		roomInfoList = [];

		let tr: object = tbodyChildNodes[i];
		let trKeys = Object.keys(tr);
		let trValues = Object.values(tr);
		// console.log("trValues: " + trValues);

		// get href and room number (first column)
		let numberTd: object = trValues[trKeys.indexOf("childNodes")][1];
		let numberTdKeys = Object.keys(numberTd);
		let numberTdValues = Object.values(numberTd);
		// console.log("numberTdValues: " + numberTdValues);
		let hrefA: object = numberTdValues[numberTdKeys.indexOf("childNodes")][1];
		let hrefAKeys = Object.keys(hrefA);
		let hrefAValues = Object.values(hrefA);
		// console.log("hrefAValues: " + hrefAValues);

		let hrefValue: object = hrefAValues[hrefAKeys.indexOf("attrs")][0];
		let hrefValueKeys = Object.keys(hrefValue);
		let hrefValueValues = Object.values(hrefValue);
		// console.log("hrefValueValues: " + hrefValueValues[hrefValueKeys.indexOf("value")]);
		roomInfoList.push(hrefValueValues[hrefValueKeys.indexOf("value")]);

		let numberValue: object = hrefAValues[hrefAKeys.indexOf("childNodes")][0];
		let numberValueKeys = Object.keys(numberValue);
		let numberValueValues = Object.values(numberValue);
		// console.log("numberValueValues: " + numberValueValues[numberValueKeys.indexOf("value")]);
		roomInfoList.push(numberValueValues[numberValueKeys.indexOf("value")]);

		// get room seats, furniture, type (second to forth column)
		for (let j = 3; j <= 7; j = j + 2) {
			let td: object = trValues[trKeys.indexOf("childNodes")][j];
			let tdKeys = Object.keys(td);
			let tdValues = Object.values(td);
			// console.log("tdValues: " + tdValues);
			let value: object = tdValues[tdKeys.indexOf("childNodes")][0];
			let valueKeys = Object.keys(value);
			let valueValues = Object.values(value);
			// console.log("valueValues: " + valueValues);
			let text: string = valueValues[valueKeys.indexOf("value")];
			// console.log("text: " + text.substring(2).trim());
			roomInfoList.push(text.substring(2).trim()); // remove \n and space
		}
		// console.log("roomsInfoList: " + roomInfoList);
		roomsJSONArray.push(convertToJSON(roomInfoList, buildingInfoArray));
	}
}

function parseBuildingInfo(node: object, buildingInfoArray: string[]){
	console.log("inside building info method");
	// parse building name and address
	let div: object = searchTreeByID(node, "building-info");
	let divKeys = Object.keys(div);
	let divValues = Object.values(div);
	// console.log("divValues: " + divValues);

	for (let i = 1; i <= 3; i = i + 2) {
		// name -> h2, address -> div
		let h2: object = divValues[divKeys.indexOf("childNodes")][i];
		let h2Keys = Object.keys(h2);
		let h2Values = Object.values(h2);
		// console.log("h2/div Values: " + h2Values);
		// name -> span, address -> div
		let span: object = h2Values[h2Keys.indexOf("childNodes")][0];
		let spanKeys = Object.keys(span);
		let spanValues = Object.values(span);
		// console.log("span/div Values: " + spanValues);
		let value: object = spanValues[spanKeys.indexOf("childNodes")][0];
		let valueKeys = Object.keys(value);
		let valueValues = Object.values(value);
		// console.log("value Values: " + valueValues);
		buildingInfoArray.push(valueValues[valueKeys.indexOf("value")]);
	}
	// get building code
}

function convertToJSON(roomInfoList: string[], buildingInfoArray: string[]) {
	// console.log("roomInfoList: " + roomInfoList);
	// console.log("buildingInfoArray: " + buildingInfoArray);
	let roomJSON: object = {
		fullName: buildingInfoArray[1],
		shortName: buildingInfoArray[0],
		number: roomInfoList[1].toString(),
		name: buildingInfoArray[0] + "_" + roomInfoList[1].toString(),
		address: buildingInfoArray[2],
		seats: roomInfoList[2],
		type: roomInfoList[4],
		furniture: roomInfoList[3],
		href: roomInfoList[0]
	};
	// roomJSON["lat"] = roomInfoList[5];
	// roomJSON["lon"] = roomInfoList[6];
	return roomJSON;
}

// parse each file with valid building code to get room data.
function parseResult(promise: Promise<string>, buildingCode: string) {
	let roomsJSONArray: object[] = [];
	promise.then(function (fileData) {
		const doc = parse5.parse(fileData);
		if (searchTreeByTag(doc.childNodes[6], "html") === null) {
			return Promise.reject(new InsightError("file is not in HTML format"));
		}
		let tableObj: object = searchTreeByTag(doc.childNodes[6], "table");
		if (tableObj !== null) {
			console.log("find table");
			let buildingInfoArray: string[] = [];
			buildingInfoArray.push(buildingCode);
			parseBuildingInfo(doc.childNodes[6], buildingInfoArray);
			console.log("buildingInfoArray: " + buildingInfoArray);
			parseTableRooms(tableObj, roomsJSONArray, buildingInfoArray);
		} else {
			console.log("cannot find table");
		}
	});
	console.log("codeArray is " + roomsJSONArray);
}

function getCodeArray(indexFile: JSZipObject[], codeArray: string[]) {
	console.log("Valid index.htm file");
	let contentIndex = indexFile[0].async("string");
	contentIndex
		.then(function (fileData) {
			// console.log("fileData is " + fileData);
			const doc = parse5.parse(fileData);
			if (searchTreeByTag(doc.childNodes[6], "html") === null) {
				return Promise.reject(new InsightError("index.htm file is not in HTML format"));
			}
			let tableObj: object = searchTreeByTag(doc.childNodes[6], "table");
			if (tableObj !== null) {
				parseTable(tableObj, codeArray);
				console.log("found table");
			}
		})
		.catch(function (err) {
			console.log("error is " + err);
		});
	// promises.push(contentIndex);
}

function jszipRooms(
	jsZip: JSZip,
	id: string,
	content: string,
	kind: InsightDatasetKind,
	addedIds: string[],
	addedDatasets: InsightDataset[]
) {
	const promises: Array<Promise<string>> = [];

	return jsZip.loadAsync(content, {base64: true}).then((zip) => {
		let indexFile = zip.file(/index.htm/);
		let codeArray: string[] = ["ACU","ALRD","ANSO","AERL","ACEN"]; // = [];

		// iterate index.htm to get building codes.
		if (indexFile.length === 1) {
			getCodeArray(indexFile, codeArray);
		} else {
			return Promise.reject(new InsightError("Invalid index.htm file"));
		}

		// iterate each file with valid building code to get room data.
		zip.forEach((relativePath, file) => {
			// if (!relativePath.includes("__MACOSX/")) {
			// 	promises.push(Promise.reject(new InsightError("invalid directory")));
			// }
			if (relativePath.startsWith("rooms/") && !relativePath.endsWith(".DS_Store")) {
				let code: string = relativePath.substring(relativePath.lastIndexOf("/") + 1);
				// console.log("relativePath is " + relativePath);
				// console.log("code is " + codeArray);
				if (codeArray.includes(code)) {
					const promise = file.async("string");
					parseResult(promise, code);
					promises.push(promise);
				}
			}
		});
		return Promise.all(promises).then(() => {
			return Promise.resolve(addedIds);
		});
	});
}

export {jszipRooms, searchTreeByID};
