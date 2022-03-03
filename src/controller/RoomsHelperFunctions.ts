import JSZip from "jszip";
import {InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import parse5 from "parse5";

// let dataPath = __dirname + "/../../data";

function searchTree(element: object, matchingTitle: string): object {
	let keys = Object.keys(element);
	let values = Object.values(element);

	if (!keys.includes("tagName")) {
		// console.log("skip " + values[keys.indexOf("nodeName")]);
		return null as any;
	}

	let childNodeIndex = keys.indexOf("childNodes");
	if (values[keys.indexOf("tagName")] === matchingTitle) {
		console.log("found matching title");
		return element;
	} else if (values[childNodeIndex].length > 0) {
		// console.log("inside " + values[keys.indexOf("tagName")]);
		let i;
		let result: object = null as any;
		for (i = 0; result === null && i < values[childNodeIndex].length; i++) {
			result = searchTree(values[childNodeIndex][i], matchingTitle);
		}
		return result;
	}
	return null as any;
}

function parseTable(table: object): string[] {
	let codeArray: string[] = [];
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
	return codeArray;
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
	let zipFolder = "rooms/";

	return jsZip.loadAsync(content, {base64: true}).then((zip) => {
		let indexFile = zip.file(/index.htm/);

		if (indexFile!.length === 1) {
			console.log("Valid index.htm file");
			let contentIndex = indexFile![0].async("string");
			contentIndex
				.then(function (fileData) {
					// console.log("fileData is " + fileData);
					const doc = parse5.parse(fileData);
					let tableObj: object = searchTree(doc.childNodes[6], "table");

					let codeArray: string[] = parseTable(tableObj);
					console.log("codeArray is " + codeArray);
					// html -> body -> div -> div -> div -> section -> div -> div -> table
				})
				.catch(function (err) {
					console.log("error is " + err);
				});
			// promises.push(contentIndex);
		} else {
			console.log("Invalid index.htm file");
		}
		// zip.forEach((relativePath, file) => {});
		return Promise.all(promises).then(() => {
			return Promise.resolve(addedIds);
		});
	});
}

export {jszipRooms};
