import fse from "fs-extra";
import JSZip from "jszip";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";

let dataPath = __dirname + "/../../data";

function checkValidSection(section: object): boolean {
	return (
		Object.prototype.hasOwnProperty.call(section, "Subject") &&
		Object.prototype.hasOwnProperty.call(section, "Course") &&
		Object.prototype.hasOwnProperty.call(section, "Avg") &&
		Object.prototype.hasOwnProperty.call(section, "Professor") &&
		Object.prototype.hasOwnProperty.call(section, "Title") &&
		Object.prototype.hasOwnProperty.call(section, "Pass") &&
		Object.prototype.hasOwnProperty.call(section, "Fail") &&
		Object.prototype.hasOwnProperty.call(section, "Audit") &&
		Object.prototype.hasOwnProperty.call(section, "id") &&
		Object.prototype.hasOwnProperty.call(section, "Year")
		// section.hasOwnProperty("id") && section.hasOwnProperty("avg") &&
		// section.hasOwnProperty("instructor") && section.hasOwnProperty("title") && section.hasOwnProperty("pass") &&
		// section.hasOwnProperty("fail") && section.hasOwnProperty("audit") && section.hasOwnProperty("uuid") &&
		// section.hasOwnProperty("year")
	);
}

// create map for each section
function formatSection(map: Map<string, number | string>, section: object) {
	let keys: string[] = Object.keys(section);
	let values: Array<string | number> = Object.values(section);
	let idxOfID = keys.indexOf("id");
	let idxOfYear = keys.indexOf("Year");
	let idxOfSection = keys.indexOf("Section");
	values[idxOfID] = "" + values[idxOfID];

	if (values[idxOfSection] === "overall") {
		values[idxOfYear] = 1900;
	} else {
		values[idxOfYear] = Number(values[idxOfYear]);
	}

	map.clear();
	for (let i = 0; i < keys.length; i++) {
		map.set(keys[i], values[i]);
	}
}

function writeToData(fileName: string, myJSON: string): void {
	return fse.writeFile(fileName, myJSON, (err) => {
		if (err) {
			console.error("file created error: " + err);
			return;
		}
		console.log("file written successfully");
	});
}

function removeItem<T>(arr: T[], value: T): T[] {
	// console.log("before: " + arr.length);
	const index = arr.indexOf(value);
	if (index > -1) {
		arr.splice(index, 1);
	}
	// console.log("after: " + arr.length);
	return arr;
}

// iterate a file and push each formatted section into tempList
function parseResult(
	promise: Promise<string>,
	mapForEachFormattedSection: Map<string, number | string>,
	tempList: any[]
) {
	promise.then(function (fileData) {
		const dataObj = JSON.parse(fileData)["result"];
		if (dataObj.length !== 0) {
			dataObj.forEach((section: object) => {
				// console.log("section is " + JSON.stringify(section));
				const validSection = checkValidSection(section);
				if (validSection) {
					formatSection(mapForEachFormattedSection, section);
					let modifiedSection = Object.fromEntries(mapForEachFormattedSection);
					tempList.push(modifiedSection);
				}
			});
		}
	});
}

// iterate through each file in zip and return an array of addedIds.
function jszipCourses(
	jsZip: JSZip,
	id: string,
	content: string,
	kind: InsightDatasetKind,
	addedIds: string[],
	addedDatasets: InsightDataset[]
) {
	const promises: Array<Promise<string>> = [];
	let tempList: any[] = [];
	let mapForEachFormattedSection: Map<string, number | string> = new Map<string, number | string>();
	let data: InsightDataset;

	return jsZip.loadAsync(content, {base64: true}).then((zip) => {
		zip.forEach((relativePath, file) => {
			if (!relativePath.includes("courses/")) {
				promises.push(Promise.reject(new InsightError("invalid directory")));
			}
			// console.log("file is " + file);
			const promise = file.async("string");
			parseResult(promise, mapForEachFormattedSection, tempList);
			promises.push(promise);
		});
		return Promise.all(promises)
			.then(() => {
				// no sections in all the files in zip
				if (tempList.length === 0) {
					return Promise.reject(new InsightError("Invalid sections"));
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
	});
}

export {removeItem, jszipCourses, writeToData};
