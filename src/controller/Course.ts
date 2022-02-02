import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
} from "./IInsightFacade";

import Section from "./Section";

export default class Course {
	dataset: InsightDataset;
	sections: Section[][];
	rank: number;

	constructor(dataset: InsightDataset, result: string[][], rank: number) {
		console.log("Course::init()");
		this.dataset = dataset;
		this.sections = [];
		this.rank = rank;
	}

	parseResultToSection(result: string[]) {
		// result.
	}
}
