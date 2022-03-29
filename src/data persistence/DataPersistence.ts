import {InsightDataset} from "../controller/IInsightFacade";
import fse from "fs-extra";

export function updateSave(addedIds: string[], addedDatasets: InsightDataset[]) {
	let jsonObj = {ids: addedIds, datasets: addedDatasets};
	let jsonString = JSON.stringify(jsonObj);
	fse.writeFile("src/data persistence/save.json", jsonString, (err) => {
		if (err) {
			// console.log(err);
			return;
		}
	});
}
