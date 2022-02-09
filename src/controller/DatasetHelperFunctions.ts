import fse from "fs-extra";

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

function formatSection(map: Map<string, number | string>, section: object){
	let keys: string[] = Object.keys(section);
	let values: Array<string| number> = Object.values(section);
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
	fse.writeFile(fileName, myJSON, (err) => {
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

export {checkValidSection, formatSection, writeToData, removeItem};
