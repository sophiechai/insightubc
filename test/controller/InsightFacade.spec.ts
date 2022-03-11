import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import {folderTest} from "@ubccpsc310/folder-test";

use(chaiAsPromised); // extends chai to use additional keywords (e.g. eventually)

type Input = unknown;
type Output = Promise<InsightResult[]>;
type Error = "InsightError" | "ResultTooLargeError";

describe("InsightFacade", function () {
	this.timeout(10000);
	let courses: string;
	let facade: IInsightFacade;

	before(function () {
		courses = getContentFromArchives("courses.zip");
	});

	beforeEach(function () {
		clearDisk();
		facade = new InsightFacade();
	});

	describe("List Datasets", function () {
		// let facade: IInsightFacade = new InsightFacade();

		// beforeEach(function () {
		//    clearDisk();
		//    facade = new InsightFacade();
		// });

		it("should list no datasets", function () {
			// return facade.listDatasets().then((insightDatasets) => {
			//    expect(insightDatasets).to.deep.equal([]);
			//
			//    // OR instead do:
			//    expect(insightDatasets).to.be.an.instanceof(Array);
			//    expect(insightDatasets).to.have.length(0);
			// });

			// OR using chai-as-promised
			const futureInsightDatasets = facade.listDatasets();
			return expect(futureInsightDatasets).to.eventually.deep.equal([]);
		});

		it("should list one datasets", async function () {
			// return facade.addDataset("courses", courses, InsightDatasetKind.Sections)
			//     .then((addedIds) => {
			//        return facade.listDatasets();
			//     })
			//     .then((insightDatasets) => {
			//        expect(insightDatasets).to.deep.equal([{
			//           id: "courses",
			//           kind: InsightDatasetKind.Sections,
			//           numRows: 64612
			//        }]);
			//
			//        // OR instead of deep.equal
			//        expect(insightDatasets).to.be.an.instanceof(Array);
			//        expect(insightDatasets).to.have.length(1);
			//        const [insightDataset] = insightDatasets; // take first element of insightDatasets
			//        expect(insightDataset).to.have.property("id");
			//        expect(insightDataset.id).to.equal("courses");
			//     });

			// OR instead use async
			await facade.addDataset("courses", courses, InsightDatasetKind.Courses);
			const insightDatasets = await facade.listDatasets();
			expect(insightDatasets).to.deep.equal([
				{
					id: "courses",
					kind: InsightDatasetKind.Courses,
					numRows: 64612,
				},
			]);
		});

		it("should list multiple datasets", function () {
			return facade
				.addDataset("courses", courses, InsightDatasetKind.Courses)
				.then(() => {
					return facade.addDataset("courses-2", courses, InsightDatasetKind.Courses);
				})
				.then(() => {
					return facade.listDatasets();
				})
				.then((insightDatasets) => {
					// const expectedDatasets: InsightDataset[] = [
					//    {
					//       id: "courses",
					//       kind: InsightDatasetKind.Sections,
					//       numRows: 64612
					//    },
					//    {
					//       id: "courses-2",
					//       kind: InsightDatasetKind.Sections,
					//       numRows: 64612
					//    }
					// ];

					expect(insightDatasets).to.be.an.instanceof(Array);
					// expect(insightDatasets).to.deep.members(expectedDatasets);
					expect(insightDatasets).to.have.length(2);
					const insightDatasetCourses = insightDatasets.find((dataset) => dataset.id === "courses");
					expect(insightDatasetCourses).to.exist;
					expect(insightDatasetCourses).to.deep.equal({
						id: "courses",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					});
					const insightDatasetCourses2 = insightDatasets.find((dataset) => dataset.id === "courses-2");
					expect(insightDatasetCourses2).to.exist;
					expect(insightDatasetCourses2).to.deep.equal({
						id: "courses-2",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					});
				});
		}).timeout(10000);
	});

	describe("Add Dataset", function () {
		describe("Successful Add Dataset", function () {
			it("should add one id", async function () {
				const addedIds = await facade.addDataset("courses2", courses, InsightDatasetKind.Courses);
				expect(addedIds).to.deep.equal(["courses2"]);
				expect(addedIds).to.have.length(1);
			});

			it("should add one id (contains whitespace character)", async function () {
				const addedIds = await facade.addDataset("ubc courses", courses, InsightDatasetKind.Courses);
				expect(addedIds).to.deep.equal(["ubc courses"]);
				expect(addedIds).to.have.length(1);
			});

			it("should add one id (one valid file)", async function () {
				let oneValidFile = getContentFromArchives("one valid.zip");

				const addedIds = await facade.addDataset("courses", oneValidFile, InsightDatasetKind.Courses);
				expect(addedIds).to.deep.equal(["courses"]);
				expect(addedIds).to.have.length(1);
			});

			it("should add multiple ids", async function () {
				await facade.addDataset("courses", courses, InsightDatasetKind.Courses);
				const addedIds = await facade.addDataset("courses-2", courses, InsightDatasetKind.Courses);
				expect(addedIds).to.be.an.instanceof(Array);
				expect(addedIds).to.have.length(2);
				const oneId = addedIds.find((id) => id === "courses");
				expect(oneId).to.exist;
				const otherId = addedIds.find((id) => id === "courses-2");
				expect(otherId).to.exist;
			}).timeout(10000);
		});

		describe("Reject With InsightError", function () {
			it("should reject if kind is room type", async function () {
				try {
					await facade.addDataset("courses", courses, InsightDatasetKind.Rooms);
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(InsightError);
				}
			});

			it("should reject if id contains underscore at beginning", async function () {
				try {
					await facade.addDataset("_courses", courses, InsightDatasetKind.Courses);
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(InsightError);
				}
			});

			it("should reject if id contains underscore in middle", async function () {
				try {
					await facade.addDataset("ubc_courses", courses, InsightDatasetKind.Courses);
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(InsightError);
				}
			});

			it("should reject if id contains underscore at end", async function () {
				try {
					await facade.addDataset("courses_", courses, InsightDatasetKind.Courses);
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(InsightError);
				}
			});

			it("should reject if id is only whitespace characters", async function () {
				try {
					await facade.addDataset(" ", courses, InsightDatasetKind.Courses);
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(InsightError);
				}
			});

			it("should reject if id is the same as an already added dataset", function () {
				return facade
					.addDataset("courses", courses, InsightDatasetKind.Courses)
					.then(() => {
						return facade.addDataset("courses", courses, InsightDatasetKind.Courses);
					})
					.then((res) => {
						throw new Error("Resolved with " + res);
					})
					.catch((err) => {
						expect(err).to.be.instanceof(InsightError);
					});
			});

			it("should reject if invalid zip file (empty)", function () {
				let empty: string = getContentFromArchives("empty.zip");

				return facade
					.addDataset("courses", empty, InsightDatasetKind.Courses)
					.then((res) => {
						throw new Error("Resolved with " + res);
					})
					.catch((err) => {
						expect(err).to.be.instanceof(InsightError);
					});
			});

			it("should reject if invalid zip file (no valid files)", function () {
				let noValidFiles: string = getContentFromArchives("no valid files.zip");

				return facade
					.addDataset("courses", noValidFiles, InsightDatasetKind.Courses)
					.then((res) => {
						throw new Error("Resolved with " + res);
					})
					.catch((err) => {
						expect(err).to.be.instanceof(InsightError);
					});
			});

			it("should reject if invalid zip file (no valid section)", function () {
				let noValidSection: string = getContentFromArchives("no valid section.zip");

				return facade
					.addDataset("courses", noValidSection, InsightDatasetKind.Courses)
					.then((res) => {
						throw new Error("Resolved with " + res);
					})
					.catch((err) => {
						expect(err).to.be.instanceof(InsightError);
					});
			});

			it("should reject if invalid zip file (incorrect directory name)", function () {
				let incorrectDir: string = getContentFromArchives("incorrect directory name.zip");

				return facade
					.addDataset("courses", incorrectDir, InsightDatasetKind.Courses)
					.then((res) => {
						throw new Error("Resolved with " + res);
					})
					.catch((err) => {
						expect(err).to.be.instanceof(InsightError);
					});
			});

			it("should reject if not a zip file", function () {
				let incorrectDir: string = getContentFromArchives("test.txt");

				return facade
					.addDataset("courses", incorrectDir, InsightDatasetKind.Courses)
					.then((res) => {
						throw new Error("Resolved with " + res);
					})
					.catch((err) => {
						expect(err).to.be.instanceof(InsightError);
					});
			});
		});
	});

	describe("Remove Dataset", function () {
		describe("Successful Remove Dataset", function () {
			it("should remove dataset with given id from one element array", async function () {
				await facade.addDataset("courses", courses, InsightDatasetKind.Courses);
				let insightDatasets = await facade.listDatasets();
				expect(insightDatasets).to.deep.equal([
					{
						id: "courses",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					},
				]);
				const removedId = await facade.removeDataset("courses");
				expect(removedId).to.equal("courses");
				insightDatasets = await facade.listDatasets();
				expect(insightDatasets).to.deep.equal([]);
			});

			it("should remove dataset with given id from two element array", async function () {
				await facade.addDataset("courses", courses, InsightDatasetKind.Courses);
				await facade.addDataset("courses-2", courses, InsightDatasetKind.Courses);
				let insightDatasets = await facade.listDatasets();
				expect(insightDatasets).to.be.instanceof(Array);
				expect(insightDatasets).to.have.length(2);
				const removedId = await facade.removeDataset("courses");
				expect(removedId).to.equal("courses");
				insightDatasets = await facade.listDatasets();
				expect(insightDatasets).to.deep.equal([
					{
						id: "courses-2",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					},
				]);
			}).timeout(10000);

			it("should remove dataset with given id (valid with whitespace)", async function () {
				await facade.addDataset("ubc courses", courses, InsightDatasetKind.Courses);
				let insightDatasets = await facade.listDatasets();
				expect(insightDatasets).to.deep.equal([
					{
						id: "ubc courses",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					},
				]);
				const removedId = await facade.removeDataset("ubc courses");
				expect(removedId).to.equal("ubc courses");
				insightDatasets = await facade.listDatasets();
				expect(insightDatasets).to.deep.equal([]);
			});
		}).timeout(10000);

		describe("Reject With Error", function () {
			it("should reject with InsightError if id has underscore", async function () {
				try {
					await facade.removeDataset("ubc_courses");
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(InsightError);
				}
			});

			it("should reject with InsightError if id is only whitespace", async function () {
				try {
					await facade.removeDataset(" ");
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(InsightError);
				}
			});

			it("should reject with NotFoundError if valid id was not yet added", async function () {
				try {
					await facade.removeDataset("courses");
					expect.fail("Should have rejected!");
				} catch (err) {
					expect(err).to.be.instanceof(NotFoundError);
				}
			});
		});
	});
});

describe("Dynamic folder test for performQuery", function () {
	this.timeout(15000);
	let courses: string;
	let facade: IInsightFacade;
	before(async function () {
		courses = getContentFromArchives("courses.zip");
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
		"./test/resources/c2_queries",
		{
			errorValidator: (error): error is Error => error === "InsightError" || error === "ResultTooLargeError",
			assertOnError: assertError,
		}
	);
});
