import JSZip, {JSZipObject} from "jszip";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import parse5, {Document} from "parse5";
import http from "http";
import {searchTreeByID, searchTreeByTag, convertToJSON} from "./RoomHelperFunction2";
import {writeToData} from "./DatasetHelperFunctions";

let dataPath = __dirname + "/../../data";
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

function parseTableRooms(table: object, buildingInfoArray: string[], tempList: object[]) {
	console.log("building info array 34: " + buildingInfoArray);
	let roomInfoList: string[];
	// return new Promise(function (resolve, reject) {
	console.log("in line 36");
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
		// console.log("roomInfoList: " + roomInfoList);
		convertToJSON(roomInfoList, buildingInfoArray, tempList);
		// console.log("tempList line 90: " + tempList);
	}
}

function parseBuildingInfo(node: object, buildingInfoArray: string[]) {
	console.log("buildingInfoArray 98: " + buildingInfoArray);
	// parse building name and address
	let div: object = searchTreeByID(node, "building-info");
	let divKeys = Object.keys(div);
	let divValues = Object.values(div);

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
	console.log("building info array: " + buildingInfoArray);
	// get building geolocation
	return getBuildingGeolocation(buildingInfoArray[2], buildingInfoArray);
}

function getBuildingGeolocation(address: string, buildingInfoArray: string[]): Promise<string> {
	let formattedAddress = address.replace(/\s/g, "%20");
	let url: string = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team558/" + formattedAddress;

	return new Promise(function (resolve, reject) {
		http.get(url, (res) => {
			const {statusCode} = res;
			const contentType = res.headers["content-type"];

			let error;
			// Any 2xx status code signals a successful response but
			// here we're only checking for 200.
			if (statusCode !== 200) {
				error = new Error("Request Failed.\n" + `Status Code: ${statusCode}`);
			} else if (!/^application\/json/.test(typeof contentType === "string" ? contentType : "")) {
				error = new Error("Invalid content-type.\n" + `Expected application/json but received ${contentType}`);
			}
			if (error) {
				console.error(error.message);
				// Consume response data to free up memory
				res.resume();
				reject();
			}

			res.setEncoding("utf8");
			let rawData = "";
			res.on("data", (chunk) => {
				rawData += chunk;
			});
			res.on("end", () => {
				try {
					const parsedData = JSON.parse(rawData);
					// console.log(parsedData);
					buildingInfoArray.push(parsedData["lat"]);
					buildingInfoArray.push(parsedData["lon"]);
					resolve("success!!!");
				} catch (e) {
					console.log("ERROR :(");
					reject("fail!!!");
				}
			});
		}).on("error", (e) => {
			console.error(`Got error: ${e.message}`);
			reject("fail!!!");
		});
	});
}
// parse each file with valid building code to get room data.
function parseResult(promise: Promise<string>, buildingCode: string, tempList: object[]) {
	let doc: Document;
	let tableObj: object;
	let buildingInfoArray: string[] = [];
	promise
		.then((fileData) => {
			doc = parse5.parse(fileData);
			if (searchTreeByTag(doc.childNodes[6], "html") === null) {
				return Promise.reject(new InsightError("file is not in HTML format"));
			}
			return searchTreeByTag(doc.childNodes[6], "table");
		})
		.then((tableObj2: object) => {
			tableObj = tableObj2;
			if (tableObj2 === null) {
				console.log("null line 208");
			}
			if (tableObj2 !== null) {
				console.log("in line 211");
				buildingInfoArray.push(buildingCode);
				console.log("building info array 213: " + buildingInfoArray);
				return parseBuildingInfo(doc.childNodes[6], buildingInfoArray);
			}
		})
		.then(() => {
			if (tableObj === null) {
				console.log("null line 219");
			}
			if (tableObj !== null) {
				console.log("in line 222");
				console.log("building info array 223: " + buildingInfoArray);
				parseTableRooms(tableObj, buildingInfoArray, tempList);
			}
		});
}

function getCodeArray(indexFile: JSZipObject[], codeArray: string[]) {
	console.log("Valid index.htm file");
	let contentIndex = indexFile[0].async("string");
	return contentIndex
		.then(function (fileData) {
			// console.log("fileData is " + fileData);
			const doc = parse5.parse(fileData);
			if (searchTreeByTag(doc.childNodes[6], "html") === null) {
				return Promise.reject(new InsightError("index.htm file is not in HTML format"));
			}
			let tableObj: object = searchTreeByTag(doc.childNodes[6], "table");
			console.log("tableObj is " + tableObj);
			if (tableObj !== null) {
				console.log("in");
				parseTable(tableObj, codeArray);
			}
			console.log("codeArray is " + codeArray);
			return [""];
		})
		.catch(function (err) {
			console.log("error is " + err);
		});
}

let globalZip: JSZip;
let codeArray: string[] = [];
const promises: Array<Promise<string>> = [];
let data: InsightDataset;

function jszipRooms(
	jsZip: JSZip,
	id: string,
	content: string,
	kind: InsightDatasetKind,
	addedIds: string[],
	addedDatasets: InsightDataset[]
): Promise<string[]> {
	let tempList: any[] = [];
	return jsZip
		.loadAsync(content, {base64: true})
		.then((zip) => {
			let indexFile = zip.file(/index.htm/);
			globalZip = zip;
			if (indexFile.length === 1) {
				// iterate index.htm to get building codes.
				return getCodeArray(indexFile, codeArray);
			}
		})
		.then(() => {
			// iterate each file with valid building code to get room data.
			globalZip.forEach((relativePath, file) => {
				if (!relativePath.includes("rooms/")) {
					promises.push(Promise.reject(new InsightError("invalid directory")));
				}
				let code: string = relativePath.substring(relativePath.lastIndexOf("/") + 1);
				if (codeArray.includes(code)) {
					let promise = file.async("string");
					parseResult(promise, code, tempList);
					promises.push(promise);
				}
			});
		})
		.then(() => {
			return Promise.all(promises);
		})
		.then(() => {
			// return createJSONAndAddToData(tempList, addedIds, addedDatasets, id, kind);
			// no sections in all the files in zip
			if (tempList.length !== 0) {
				return Promise.reject(new InsightError("No Valid Rooms"));
			} else {
				// create a json object that contains all sections in all the files under the zip file
				data = {id, kind, numRows: tempList.length};
				const myJSON = JSON.stringify({header: data, contents: tempList});
				const fileName = dataPath + "/" + id + ".json";
				return writeToData(fileName, myJSON);
			}
		})
		.then(function () {
			addedIds.push(id);
			addedDatasets.push(data);
			return Promise.resolve(addedIds);
		});
}
export {jszipRooms, searchTreeByID};
