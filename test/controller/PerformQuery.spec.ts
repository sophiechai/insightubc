import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError,
} from "../../src/controller/IInsightFacade";
import {getContentFromArchives} from "../TestUtil";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect} from "chai";
import {folderTest} from "@ubccpsc310/folder-test";
// import {filter} from "../../src/controller/Filter";

type Input = unknown;
type Output = Promise<InsightResult[]>;
type Error = "InsightError" | "ResultTooLargeError";

describe("Dynamic folder test for performQuery", function () {
	this.timeout(10000);
	let courses: string;
	let facade: IInsightFacade;
	before(async function () {
		courses = getContentFromArchives("one valid.zip");
		// let coursesSmaller = getContentFromArchives("courses_smaller.zip");
		facade = new InsightFacade();
		await facade.addDataset("courses", courses, InsightDatasetKind.Courses);
		await facade.addDataset("courses2", courses, InsightDatasetKind.Courses);
	});

	// Assert actual error is of expected type
	function assertError(actual: any, expected: Error): void {
		if (expected === "InsightError") {
			expect(actual).to.be.an.instanceOf(InsightError);
		} else if (expected === "ResultTooLargeError") {
			expect(actual).to.be.an.instanceOf(ResultTooLargeError);
		} else {
			expect.fail("UNEXPECTED ERROR");
		}
	}

	folderTest<Input, Output, Error>(
		"performQuery tests",
		(input: Input): Output => facade.performQuery(input),
		"./test/resources/queries_small",
		{
			errorValidator: (error): error is Error => error === "InsightError" || error === "ResultTooLargeError",
			assertOnError: assertError,
		}
	);
});
