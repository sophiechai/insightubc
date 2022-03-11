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
		courses = getContentFromArchives("rooms.zip");
	});

	beforeEach(function () {
		clearDisk();
		facade = new InsightFacade();
	});

	describe("Add Dataset", function () {
		describe("Successful Add Dataset", function () {
			it("should add one id", async function () {
				const addedIds = await facade.addDataset("rooms", courses, InsightDatasetKind.Rooms);
				expect(addedIds).to.deep.equal(["rooms"]);
				expect(addedIds).to.have.length(1);
			});

			// it("find id tag", async function () {
			// 	const doc = parse5.parse("../resources/ALRD");
			// 	console.log(doc.childNodes[6]);
			// 	searchTreeByID(doc.childNodes[6], "building-info");
			// });
		});
	});

	describe("Perform Query", function () {
		describe("Successful Perform Query", function () {
			it("should add one id", async function () {
				const addedIds = await facade.addDataset("rooms", courses, InsightDatasetKind.Rooms);
				expect(addedIds).to.deep.equal(["rooms"]);
				expect(addedIds).to.have.length(1);
				await facade.performQuery({
					WHERE: {},
					OPTIONS: {
						COLUMNS: ["rooms_shortname", "sumSeats", "maxSeats"],
						ORDER: {
							dir: "DOWN",
							keys: ["maxSeats"],
						},
					},
					TRANSFORMATIONS: {
						GROUP: ["rooms_shortname", "rooms_seats", "rooms_type"],
						APPLY: [
							{
								sumSeats: {
									SUM: "rooms_seats",
								},
							},
							{
								maxSeats: {
									MAX: "rooms_seats",
								},
							},
						],
					},
				});
			});
		});
	});
});

describe("Dynamic folder test for performQuery", function () {
	this.timeout(15000);
	let rooms: string;
	let facade: IInsightFacade;
	before(async function () {
		rooms = getContentFromArchives("rooms.zip");
		facade = new InsightFacade();
		await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
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
