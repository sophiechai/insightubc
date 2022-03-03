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
		});
	});
});
