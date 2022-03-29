import JSZip, {JSZipObject} from "jszip";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import parse5, {Document} from "parse5";
import http from "http";
import {searchTreeByID, searchTreeByTag, convertToJSON} from "./RoomHelperFunction2";
import {writeToData} from "./DatasetHelperFunctions";
import {checkNonNull} from "./Filter";
import {updateSave} from "../data persistence/DataPersistence";
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
function parseTableRooms(table: object, roomsInfoArray: Map<string, string[][]>, code: string) {
	let tableKeys = Object.keys(table);
	let tableValues = Object.values(table);
	let tbody: object = tableValues[tableKeys.indexOf("childNodes")][3];

	let tbodyKeys = Object.keys(tbody);
	let tbodyValues = Object.values(tbody);
	let tbodyChildNodes = tbodyValues[tbodyKeys.indexOf("childNodes")];
	for (let i = 1; i < tbodyChildNodes.length - 1; i = i + 2) {
		let tempRoomInfoList2: string[] = [];

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
		tempRoomInfoList2.push(hrefValueValues[hrefValueKeys.indexOf("value")]);

		let numberValue: object = hrefAValues[hrefAKeys.indexOf("childNodes")][0];
		let numberValueKeys = Object.keys(numberValue);
		let numberValueValues = Object.values(numberValue);
		// console.log("numberValueValues: " + numberValueValues[numberValueKeys.indexOf("value")]);
		tempRoomInfoList2.push(numberValueValues[numberValueKeys.indexOf("value")]);

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
			tempRoomInfoList2.push(text.substring(2).trim()); // remove \n and space
		}
		if (roomsInfoArray.has(code)) {
			checkNonNull(roomsInfoArray.get(code)).push(tempRoomInfoList2);
		} else {
			roomsInfoArray.set(code, [tempRoomInfoList2]);
		}
	}
}

function parseBuildingInfo(
	node: object,
	buildingCode: string,
	roomsTable: object,
	buildingInfoArray: Map<string, Array<string|object>>) {

	let tempBuildingInfoArray: Array<string|object> = [];
	tempBuildingInfoArray.push(buildingCode);
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
		tempBuildingInfoArray.push(valueValues[valueKeys.indexOf("value")]);
	}
	tempBuildingInfoArray.push(roomsTable);
	buildingInfoArray.set(buildingCode, tempBuildingInfoArray);
}

function getBuildingGeolocation(address: string, buildingInfoArray: Array<string|object>): Promise<string>{
	let formattedAddress = address.replace(/\s/g, "%20");
	let url: string = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team558/" + formattedAddress;

	return new Promise(function (resolve, reject) {
		http.get(url, (res) => {
			const {statusCode} = res;
			const contentType = res.headers["content-type"];

			let error;
		// Any 2xx status code signals a successful response but here we're only checking for 200.
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
function parseResult(
	promise: Promise<string>,
	buildingCode: string,
	buildingInfoArray: Map<string, Array<string|object>>) {
	let doc: Document;
	promise
		.then((fileData) => {
			doc = parse5.parse(fileData);
			if (searchTreeByTag(doc.childNodes[6], "html") === null) {
				throw new InsightError("not valid html");
			}
			let tableObj = searchTreeByTag(doc.childNodes[6], "table");
			if (tableObj !== null) {
				parseBuildingInfo(doc.childNodes[6], buildingCode, tableObj, buildingInfoArray); // populate buildingInfoArray
			}
		})
		.catch((err) => {
			console.log(err);
		});
}

function getCodeArray(indexFile: JSZipObject[], codeArray: string[]): Promise<string[]> {
	let contentIndex = indexFile[0].async("string");
	return contentIndex
		.then(function (fileData) {
			const doc = parse5.parse(fileData);
			if (searchTreeByTag(doc.childNodes[6], "html") === null) {
				return Promise.reject(new InsightError("index.htm file is not in HTML format"));
			}
			let tableObj: object = searchTreeByTag(doc.childNodes[6], "table");
			if (tableObj !== null) {
				parseTable(tableObj, codeArray);
			}
		})
		.catch(function (err) {
			console.log("error is " + err);
			return err;
		});
}

function combineRoomsAndBuildingInfo(
	buildingInfoArray: Map<string, Array<string|object>>,
	roomInfoList: Map<string, string[][]>,
	tempList: object[],
	id: string,
	kind: InsightDatasetKind): InsightDataset {
	for (let [key, item] of buildingInfoArray) {
		if (typeof item[3] === "object") {
			parseTableRooms(item[3], roomInfoList, key);
		}
	}
	convertToJSON(roomInfoList, buildingInfoArray, tempList);
	// no sections in all the files in zip
	let data: InsightDataset;
	if (tempList.length === 0) {
		throw new InsightError("no valid buildings");
	} else {
		// create a json object that contains all sections in all the files under the zip file
		data = {id, kind, numRows: tempList.length};
		const myJSON = JSON.stringify({header: data, contents: tempList});
		const fileName = dataPath + "/" + id + ".json";
		writeToData(fileName, myJSON);
		return data;
	}
}

function iterateFile(globalZip: JSZip, codeArray: string[], buildingInfoArray: Map<string, Array<string|object>>) {
	const promises: Array<Promise<string>> = [];
	// iterate each file with valid building code to get room data.
	globalZip.forEach((relativePath, file) => {
		if (!relativePath.includes("rooms/")) {
			promises.push(Promise.reject(new InsightError("invalid directory")));
		}
		let code: string = relativePath.substring(relativePath.lastIndexOf("/") + 1);
		if (codeArray.includes(code)) {
			let promise = file.async("string");
			parseResult(promise, code, buildingInfoArray);
			promises.push(promise);
		}
	});
	return Promise.all(promises);
}

function jszipRooms(
	jsZip: JSZip,
	id: string,
	content: string,
	kind: InsightDatasetKind,
	addedIds: string[],
	addedDatasets: InsightDataset[]
): Promise<string[]> {

	let tempList: object[] = [];
	let buildingInfoArray: Map<string, Array<string|object>> = new Map();
	let roomInfoList: Map<string, string[][]> = new Map();
	let codeArray: string[] = [];
	let globalZip: JSZip;

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
			return iterateFile(globalZip, codeArray, buildingInfoArray);
		})
		.then((promise: string[]) => {
			const promises: Array<Promise<string>> = [];
			for (let [key, item] of buildingInfoArray) {
				promises.push(getBuildingGeolocation(item[2].toString(), item));
			}
			return Promise.all(promises);
		})
		.then((promise: string[]) => {
			let data = combineRoomsAndBuildingInfo(buildingInfoArray, roomInfoList, tempList, id, kind);
			addedIds.push(id);
			addedDatasets.push(data);
			updateSave(addedIds, addedDatasets);
			return Promise.resolve(addedIds);
		})
		.catch((err) => {
			console.log("error");
			return Promise.reject(err);
		});
}
export {jszipRooms, searchTreeByID};
