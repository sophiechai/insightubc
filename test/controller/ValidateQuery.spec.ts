import {
	isBodyValid,
	isColumnsValid,
	isOptionsValid,
	isOrderValid,
	isQueryValid
} from "../../src/controller/ValidateQuery";
import {expect} from "chai";
import {InsightError} from "../../src/controller/IInsightFacade";


describe("ValidateQuery", function () {
	describe("isQueryValid", function () {
		it("should return InsightError if no WHERE property found", function () {
			let query =
				{
					OPTIONS: {
						COLUMNS: [
							"courses_dept",
							"courses_avg"
						],
						ORDER: "courses_avg"
					}
				};
			expect(isQueryValid(query)).to.be.instanceOf(InsightError);
		});

		it("should return InsightError if no OPTIONS property found", function () {
			let query =
				{
					WHERE: {
						GT: {
							courses_avg: 99
						}
					}
				};
			expect(isQueryValid(query)).to.be.instanceof(InsightError);
		});

		it("should return InsightError if more than 2 toplevel properties", function () {
			let query =
				{
					WHERE: {
						GT: {
							courses_avg: 99
						}
					},
					OPTIONS: {
						COLUMNS: [
							"courses_avg"
						],
						ORDER: "courses_avg"
					},
					OTHER: {}
				};
			expect(isQueryValid(query)).to.be.instanceof(InsightError);
		});

		it("should return InsightError if more than 2 toplevel properties", function () {
			let query =
				{
					OPTIONS: {
						COLUMNS: [
							"courses_avg"
						],
						ORDER: "courses_avg"
					},
					WHERE: {
						GT: {
							courses_avg: 99
						}
					}
				};
			expect(isQueryValid(query)).to.be.instanceof(InsightError);
		});
	});

	// describe("isBodyValid", function () {});

	// describe("isLogicComparisonValid", function () {});

	// describe("isMComparisonValid", function () {});

	// describe("isSComparisonValid", function () {});

	// describe("isNegationValid", function () {});

	describe("isOptionsValid", function () {
		it("should return InsightError if missing COLUMNS", function () {
			let options =
				{
					ORDER: "courses_avg"
				};
			expect(isOptionsValid(options)).to.be.instanceof(InsightError);
		});

		it("should return InsightError if COLUMNS is empty", function () {
			let options =
				{
					COLUMNS: [],
					ORDER: "courses_avg"
				};
			expect(isOptionsValid(options)).to.be.instanceof(InsightError);
		});

		it("should return InsightError if ORDER string is not in COLUMNS array", function () {
			let options =
				{
					COLUMNS: [
						"courses_avg",
						"courses_instructor"
					],
					ORDER: "courses_pass"
				};
			expect(isOptionsValid(options)).to.be.instanceof(InsightError);
		});
	});

	describe("isColumnsValid", function () {
		it("should return false if COLUMNS array is empty", function () {
			let result = isColumnsValid([]);
			expect(result).to.equal(false);
		});
	});

	describe("isOrderValid", function () {
		it("should return false if key is not in the given array", function () {
			let keys = ["courses_avg", "courses_pass", "courses_fail"];
			let result = isOrderValid("courses_year", keys);
			expect(result).to.equal(false);
		});

		it("should return true if key is in the given array", function () {
			let keys = ["courses_avg", "courses_year"];
			let result = isOrderValid("courses_year", keys);
			expect(result).to.equal(true);
		});
	});
});
