import JSZip, {JSZipObject} from "jszip";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import parse5, {Document} from "parse5";
import http from "http";
import {searchTreeByID, searchTreeByTag, createJSONAndAddToData} from "./RoomHelperFunction2";

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
		convertToJSON(roomInfoList, buildingInfoArray, tempList);
	}
}

function parseBuildingInfo(node: object, buildingInfoArray: string[]) {
	// console.log("inside building info method");
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
	// get building geolocation
	// return getBuildingGeolocation(buildingInfoArray[2], buildingInfoArray);
}

function getBuildingGeolocation(address: string, buildingInfoArray: string[]) {
	let formattedAddress = address.replace(/\s/g, "%20");
	console.log("format address: " + formattedAddress);
	let url: string = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team558/" + formattedAddress;

	return new Promise(function (resolve, reject) {
		http.get(url, (res) => {
			console.log("in");
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
				return;
			}

			res.setEncoding("utf8");
			let rawData = "";
			res.on("data", (chunk) => {
				rawData += chunk;
			});
			res.on("end", () => {
				try {
					const parsedData = JSON.parse(rawData);
					console.log(parsedData);
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

		// return http
		// 	.get(url, (res) => {
		// 		res.setEncoding("utf8");
		// 		let rawData = "";
		// 		res.on("data", (chunk) => {
		// 			rawData += chunk;
		// 		});
		// 		res.on("end", () => {
		// 			try {
		// 				const parsedData = JSON.parse(rawData);
		// 				console.log("parsedData: " + parsedData);
		// 				resolve("success!!!");
		// 			} catch (e) {
		// 				console.error("error!");
		// 				reject("fail!!!");
		// 			}
		// 		});
		// 	})
		// 	.on("error", (e) => {
		// 		console.error(`Got error: ${e.message}`);
		// 		reject("fail !!!");
		// 	});
	});
}

function convertToJSON(roomInfoList: string[], buildingInfoArray: string[], tempList: object[]) {
	// console.log("roomInfoList: " + roomInfoList);
	// console.log("buildingInfoArray: " + buildingInfoArray);
	let roomJSON: object = {
		fullName: buildingInfoArray[1],
		shortName: buildingInfoArray[0],
		number: roomInfoList[1].toString(),
		name: buildingInfoArray[0] + "_" + roomInfoList[1].toString(),
		address: buildingInfoArray[2],
		lat: 0,
		lon: 0,
		seats: roomInfoList[2],
		type: roomInfoList[4],
		furniture: roomInfoList[3],
		href: roomInfoList[0],
	};
	tempList.push(roomJSON);
}

// parse each file with valid building code to get room data.
function parseResult(promise: Promise<string>, buildingCode: string, tempList: object[]) {
	let doc: Document;
	let tableObj: object;
	let buildingInfoArray: string[] = [];
	promise
		.then(function (fileData) {
			doc = parse5.parse(fileData);
			if (searchTreeByTag(doc.childNodes[6], "html") === null) {
				return Promise.reject(new InsightError("file is not in HTML format"));
			}
			tableObj = searchTreeByTag(doc.childNodes[6], "table");
		})
		.then(function () {
			if (tableObj !== null) {
				// console.log("find table");
				buildingInfoArray.push(buildingCode);
				return parseBuildingInfo(doc.childNodes[6], buildingInfoArray);
			}
		})
		.then(function () {
			if (tableObj !== null) {
				console.log("buildingInfoArray: " + buildingInfoArray);
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
			if (tableObj !== null) {
				parseTable(tableObj, codeArray);
			}
			return [""];
		})
		.catch(function (err) {
			console.log("error is " + err);
		});
	// promises.push(contentIndex);
}

let globalZip: JSZip;
let codeArray: string[] = [];
const promises: Array<Promise<string>> = [];

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
			if (indexFile.length === 1) { // iterate index.htm to get building codes.
				return getCodeArray(indexFile, codeArray);
			}
		}).then(() => {
			// iterate each file with valid building code to get room data.
			globalZip.forEach((relativePath, file) => {
				if (!relativePath.includes("rooms/")) {
					promises.push(Promise.reject(new InsightError("invalid directory")));
				} else {
					let code: string = relativePath.substring(relativePath.lastIndexOf("/") + 1);
					if (codeArray.includes(code)) {
						const promise = file.async("string");
						parseResult(promise, code, tempList);
						promises.push(promise);
					}
				}
			});
		}).then(() => {
			return Promise.all(promises);
		}).then(() => {
			return createJSONAndAddToData(tempList, addedIds, addedDatasets, id, kind);
		});
}
export {jszipRooms, searchTreeByID};
