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

function writeToData(fileName: string, myJSON: string): void {
	fse.writeFile(fileName, myJSON, (err) => {
		if (err) {
			console.error("file created error: " + err);
			return;
		}
		console.log("file written successfully");
	});
}

export {checkValidSection, writeToData};
