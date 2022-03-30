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
import {clearDisk, getContentFromArchives, getContentFromArchivesAwait} from "../TestUtil";
import {folderTest} from "@ubccpsc310/folder-test";

use(chaiAsPromised); // extends chai to use additional keywords (e.g. eventually)

type Input = unknown;
type Output = Promise<InsightResult[]>;
type Error = "InsightError" | "ResultTooLargeError";

describe("InsightFacade", function () {
	this.timeout(10000);
	let courses: Promise<string>;
	let rooms: Promise<string>;
	let facade: IInsightFacade;

	before(function () {
		courses = getContentFromArchives("courses.zip");
		rooms = getContentFromArchives("rooms.zip");
	});

	beforeEach(function () {
		clearDisk();
		facade = new InsightFacade();
	});

	describe("List Datasets", function () {

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
			courses.then(function (content) {
				return facade.addDataset("courses", content, InsightDatasetKind.Courses);
			}).then((addedIds) => {
				return facade.listDatasets();
			}).then((addedIds) => {
				return rooms.then(function (content) {
					return facade.addDataset("rooms", content, InsightDatasetKind.Rooms);
				});
			}).then((insightDatasets) => {
				expect(insightDatasets).to.deep.equal([{
					id: "courses",
					kind: InsightDatasetKind.Courses,
					numRows: 64612
				},
				{
					id: "rooms",
					kind: InsightDatasetKind.Rooms,
					numRows: 364
				}
				]);

				// OR instead of deep.equal
				expect(insightDatasets).to.be.an.instanceof(Array);
				expect(insightDatasets).to.have.length(2);
				// const [insightDataset] = insightDatasets; // take first element of insightDatasets
				// expect(insightDataset).to.have.property("id");
				// expect(insightDataset.id).to.equal("courses");
			}).catch((err: InsightError) => {
				expect(err).to.be.instanceof(InsightError);
			});

			// OR instead use async
			// await facade.addDataset("courses", courses, InsightDatasetKind.Courses);
			// const insightDatasets = await facade.listDatasets();
			// expect(insightDatasets).to.deep.equal([
			// 	{
			// 		id: "courses",
			// 		kind: InsightDatasetKind.Courses,
			// 		numRows: 64612,
			// 	},
			// ]);
		});

		it("should list multiple datasets", function () {
			courses.then(function (content) {
				return facade.addDataset("courses", content, InsightDatasetKind.Courses);
			}).then(() => {
				return facade.listDatasets();
			})
				.then((insightDatasets) => {
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
		});

		// it("should list multiple courses and rooms datasets", function () {
		// 	courses.then(function (content) {
		// 		return facade.addDataset("courses", content, InsightDatasetKind.Courses);
		// 	})
		// 		.then(() => {
		// 			return facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
		// 		})
		// 		.then(() => {
		// 			return facade.addDataset("courses2", courses, InsightDatasetKind.Courses);
		// 		})
		// 		.then(() => {
		// 			return facade.addDataset("rooms2", rooms, InsightDatasetKind.Rooms);
		// 		})
		// 		.then(() => {
		// 			return facade.listDatasets();
		// 		})
		// 		.then((insightDatasets) => {
		// 			expect(insightDatasets).to.be.an.instanceof(Array);
		// 			expect(insightDatasets).to.have.length(4);
		// 			const insightDatasetCourses = insightDatasets.find((dataset) => dataset.id === "courses");
		// 			expect(insightDatasetCourses).to.exist;
		// 			const insightDatasetCourses2 = insightDatasets.find((dataset) => dataset.id === "courses2");
		// 			expect(insightDatasetCourses2).to.exist;
		// 			const insightDatasetRooms = insightDatasets.find((dataset) => dataset.id === "rooms");
		// 			expect(insightDatasetRooms).to.exist;
		// 			const insightDatasetRooms2 = insightDatasets.find((dataset) => dataset.id === "rooms2");
		// 			expect(insightDatasetRooms2).to.exist;
		// 		});
		// });
	});

	describe("Add Dataset", function () {
		describe("Successful Add Dataset", function () {
			it("should add one id", async function () {
				courses.then(function (content) {
					return facade.addDataset("courses", content, InsightDatasetKind.Courses);
				}).then((addedIds: string[]) => {
					expect(addedIds).to.deep.equal(["courses2"]);
					expect(addedIds).to.have.length(1);
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});

			it("should add one id (contains whitespace character)", function () {
				courses.then(function (content) {
					return facade.addDataset("courses", content, InsightDatasetKind.Courses);
				}).then((addedIds: string[]) => {
					expect(addedIds).to.deep.equal(["ubc courses"]);
					expect(addedIds).to.have.length(1);
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});

			it("should add one id (contains whitespace character) for rooms", function () {
				rooms.then(function (content) {
					return facade.addDataset("ubc rooms", content, InsightDatasetKind.Rooms);
				}).then((addedIds: string[]) => {
					expect(addedIds).to.deep.equal(["ubc rooms"]);
					expect(addedIds).to.have.length(1);
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});

			it("should add one id (one valid file)", async function () {
				let oneValidFile = getContentFromArchives("one valid.zip");

				oneValidFile.then(function (content) {
					return facade.addDataset("courses", content, InsightDatasetKind.Courses);
				}).then((addedIds: string[]) => {
					expect(addedIds).to.deep.equal(["courses"]);
					expect(addedIds).to.have.length(1);
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});

			it("should add multiple ids", async function () {
				courses.then(function (content) {
					return facade.addDataset("courses", content, InsightDatasetKind.Courses);
				}).then((addedIds: string[]) => {
					expect(addedIds).to.be.an.instanceof(Array);
					expect(addedIds).to.have.length(2);
					const oneId = addedIds.find((id) => id === "courses");
					expect(oneId).to.exist;
					const otherId = addedIds.find((id) => id === "courses-2");
					expect(otherId).to.exist;
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});
		});

		describe("Reject With InsightError", function () {
			it("should reject if kind is room type", async function () {
				courses.then(function (content) {
					return facade.addDataset("courses", content, InsightDatasetKind.Rooms);
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});

			it("should reject if id contains underscore at beginning", async function () {
				courses.then(function (content) {
					return facade.addDataset("_courses", content, InsightDatasetKind.Courses);
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});

			it("should reject if id contains underscore in middle", async function () {
				courses.then(function (content) {
					return facade.addDataset("ubc_courses", content, InsightDatasetKind.Courses);
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});

			it("should reject if id contains underscore at end", async function () {
				courses.then(function (content) {
					return facade.addDataset("courses_", content, InsightDatasetKind.Courses);
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});

			it("should reject if id is only whitespace characters", async function () {
				courses.then(function (content) {
					return facade.addDataset(" ", content, InsightDatasetKind.Courses);
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});

			it("should reject if id is the same as an already added dataset", function () {
				let globalContent: string = "";
				courses.then(function (content) {
					globalContent = content;
					return facade.addDataset("courses", globalContent, InsightDatasetKind.Courses);
				}).then(() => {
					return facade.addDataset("courses", globalContent, InsightDatasetKind.Courses);
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});

			it("should reject if invalid zip file (empty)", function () {
				let empty: Promise<string> = getContentFromArchives("empty.zip");

				empty.then(function (content) {
					return facade.addDataset("courses", content, InsightDatasetKind.Courses);
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});

			it("should reject if invalid zip file (no valid files)", function () {
				let noValidFiles: Promise<string> = getContentFromArchives("no valid files.zip");

				noValidFiles.then(function (content) {
					return facade.addDataset("courses", content, InsightDatasetKind.Courses);
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});

			it("should reject if invalid zip file (no valid section)", function () {
				let noValidSection: Promise<string> = getContentFromArchives("no valid section.zip");

				noValidSection.then(function (content) {
					return facade.addDataset("courses", content, InsightDatasetKind.Courses);
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});

			it("should reject if invalid zip file (incorrect directory name)", function () {
				let incorrectDir: Promise<string> = getContentFromArchives("incorrect directory name.zip");

				incorrectDir.then(function (content) {
					return facade.addDataset("courses", content, InsightDatasetKind.Courses);
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});

			it("should reject if not a zip file", function () {
				let invalidZip: Promise<string> = getContentFromArchives("test.txt");

				invalidZip.then(function (content) {
					return facade.addDataset("courses", "content", InsightDatasetKind.Courses);
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});

			it("...", function () {
				// let invalidZip: Promise<string> = getContentFromArchives("test.txt");

				// invalidZip.then(function (content) {
				facade.addDataset("rooms", "abcd", InsightDatasetKind.Rooms)
					.then(() => {
						console.log("in");
					}).catch((err: InsightError) => {
						expect(err).to.be.instanceof(InsightError);
					});
			});
		});
	});

	describe("Remove Dataset", function () {
		describe("Successful Remove Dataset", function () {
			it("should remove dataset with given id from one element array", function () {
				courses.then(function (content) {
					return facade.addDataset("courses", content, InsightDatasetKind.Courses);
				}).then(() => {
					return facade.listDatasets();
				}).then((insightDatasets) => {
					expect(insightDatasets).to.deep.equal([
						{
							id: "courses",
							kind: InsightDatasetKind.Courses,
							numRows: 64612,
						},
					]);
					return facade.removeDataset("courses");
				}).then((removedId) => {
					expect(removedId).to.equal("courses");
					return facade.listDatasets();
				}).then((insightDatasets) => {
					expect(insightDatasets).to.deep.equal([]);
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});

			it("should remove dataset with given id from two element array", async function () {
				let globalContent: string = "";
				courses.then(function (content) {
					globalContent = content;
					return facade.addDataset("courses", content, InsightDatasetKind.Courses);
				}).then(function (content) {
					return facade.addDataset("courses-2", globalContent, InsightDatasetKind.Courses);
				}).then(() => {
					return facade.listDatasets();
				}).then((insightDatasets) => {
					expect(insightDatasets).to.be.instanceof(Array);
					expect(insightDatasets).to.have.length(2);
					return facade.removeDataset("courses");
				}).then((removedId) => {
					expect(removedId).to.equal("courses");
					return facade.listDatasets();
				}).then((insightDatasets) => {
					expect(insightDatasets).to.deep.equal([
						{
							id: "courses-2",
							kind: InsightDatasetKind.Courses,
							numRows: 64612,
						},
					]);
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});

			it("should remove dataset with given id (valid with whitespace)", async function () {
				courses.then(function (content) {
					return facade.addDataset("ubc courses", content, InsightDatasetKind.Courses);
				}).then(() => {
					return facade.listDatasets();
				}).then((insightDatasets) => {
					expect(insightDatasets).to.deep.equal([
						{
							id: "ubc courses",
							kind: InsightDatasetKind.Courses,
							numRows: 64612,
						},
					]);
					return facade.removeDataset("ubc courses");
				}).then((removedId) => {
					expect(removedId).to.equal("ubc courses");
					return facade.listDatasets();
				}).then((insightDatasets) => {
					expect(insightDatasets).to.deep.equal([]);
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});
		});

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

	describe("Perform Query", function () {
		describe("Invalid Query input", function () {
			it("should reject if empty string query input", function () {
				courses.then(function (content) {
					return facade.addDataset("courses", content, InsightDatasetKind.Courses);
				}).then(() => {
					facade.performQuery("");
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});

			it("should reject if null string query input", function () {
				courses.then(function (content) {
					return facade.addDataset("courses", content, InsightDatasetKind.Courses);
				}).then(() => {
					facade.performQuery(null);
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});

			it("should reject if undefined string query input", function () {
				courses.then(function (content) {
					return facade.addDataset("courses", content, InsightDatasetKind.Courses);
				}).then(() => {
					facade.performQuery(undefined);
				}).catch((err: InsightError) => {
					expect(err).to.be.instanceof(InsightError);
				});
			});
		});
	});
});

describe("Dynamic folder test for performQuery", function () {
	this.timeout(20000);
	let courses: string;
	let rooms: string;
	let facade: IInsightFacade;
	before(async function () {
		clearDisk();
		courses = getContentFromArchivesAwait("courses.zip");
		rooms = getContentFromArchivesAwait("rooms.zip");
		facade = new InsightFacade();
		// courses.then((content) => {
		// 	return facade.addDataset("rooms", content, InsightDatasetKind.Rooms);
		// }).then(() => {
		// 	return rooms.then((content) => {
		// 		return facade.addDataset("courses", content, InsightDatasetKind.Courses);
		// 	});
		// });
		await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
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
		"./test/resources/queries",
		{
			errorValidator: (error): error is Error => error === "InsightError" || error === "ResultTooLargeError",
			assertOnError: assertError,
		}
	);
});
