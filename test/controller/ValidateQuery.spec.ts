import {
	isBodyValid,
	isColumnsValid, isLogicComparisonValid, isMComparisonValid, isNegationValid,
	isOptionsValid,
	isOrderValid,
	isQueryValid, isSComparisonValid
} from "../../src/controller/ValidateQuery";
import {expect} from "chai";
import {InsightError} from "../../src/controller/IInsightFacade";

let ids = ["courses"];

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
			// expect(isQueryValid(query, ids)).to.be.instanceOf(InsightError);
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
			// expect(isQueryValid(query, ids)).to.be.instanceof(InsightError);
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
			// expect(isQueryValid(query, ids)).to.be.instanceof(InsightError);
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
			// expect(isQueryValid(query, ids)).to.be.instanceof(InsightError);
		});
	});


	describe("isBodyValid", function () {
		it("should return true if no filter in WHERE", function () {
			let where = {};
			expect(isBodyValid(where)).to.equal(true);
		});

		it("should return false if more than 1 filter in WHERE", function () {
			let where =
				{
					GT: {
						courses_avg: 99
					},
					EQ: {
						courses_avg: 99
					}
				};
			expect(isBodyValid(where)).to.equal(false);
		});

		it("should return false if invalid filter", function () {
			let where =
				{
					EQUAL: {
						courses_year: 2000
					}
				};
			expect(isBodyValid(where)).to.equal(false);
		});
	});


	describe("isLogicComparisonValid", function () {
		it("should return true if valid one item array", function () {
			let array =
				[
					{
						GT: {
							courses_avg: 90
						}
					}
				];
			expect(isLogicComparisonValid(array)).to.equal(true);
		});

		it("should return true if valid multiple items array", function () {
			let array =
				[
					{
						GT: {
							courses_avg: 90
						}
					},
					{
						IS: {
							courses_dept: "math"
						}
					}
				];
			expect(isLogicComparisonValid(array)).to.equal(true);
		});

		it("should return false if empty array", function () {
			let array: object[] = [];
			expect(isLogicComparisonValid(array)).to.equal(false);
		});
	});


	describe("isMComparisonValid", function () {
		it("should return false if more than one key", function () {
			let mcomp =
				{
					courses_year: 2000,
					courses_pass: 50
				};
			expect(isMComparisonValid(mcomp)).to.equal(false);
		});

		it("should return false if no key", function () {
			let mcomp = {};
			expect(isMComparisonValid(mcomp)).to.equal(false);
		});

		it("should return true if exactly one valid key", function () {
			let mcomp =
				{
					courses_year: 2000
				};
			expect(isMComparisonValid(mcomp)).to.equal(true);
		});

		it("should return ...", function () {
			// idk
		});
	});


	describe("isSComparisonValid", function () {
		it("should return false if no key", function () {
			let scomp = {};
			expect(isSComparisonValid(scomp)).to.equal(false);
		});

		it("should return false if more than one key", function () {
			let scomp =
				{
					courses_uuid: "12345",
					courses_dept: "cpsc"
				};
			expect(isSComparisonValid(scomp)).to.equal(false);
		});

		it("should return true if exactly one valid key", function () {
			let scomp =
				{
					courses_dept: "cpsc"
				};
			expect(isSComparisonValid(scomp)).to.equal(true);
		});
	});


	describe("isNegationValid", function () {
		it("should return false if no filter", function () {
			let neg = {};
			expect(isNegationValid(neg)).to.equal(false);
		});

		it("should return false if no valid filter", function () {
			let neg =
				{
					EQUAL: {
						courses_avg: 99
					}
				};
			expect(isNegationValid(neg)).to.equal(false);
		});

		it("should return true if one valid filter", function () {
			let neg =
				{
					GT: {
						courses_avg: 10
					}
				};
			expect(isNegationValid(neg)).to.equal(true);
		});
	});


	describe("isOptionsValid", function () {
		it("should return false if missing COLUMNS", function () {
			let options =
				{
					ORDER: "courses_avg"
				};
			expect(isOptionsValid(options)).to.equal(false);
		});

		it("should return false if COLUMNS is empty", function () {
			let options =
				{
					COLUMNS: [],
					ORDER: "courses_avg"
				};
			expect(isOptionsValid(options)).to.equal(false);
		});

		it("should return false if ORDER string is not in COLUMNS array", function () {
			let options =
				{
					COLUMNS: [
						"courses_avg",
						"courses_instructor"
					],
					ORDER: "courses_pass"
				};
			expect(isOptionsValid(options)).to.equal(false);
		});
	});


	describe("isColumnsValid", function () {
		it("should return false if COLUMNS array is empty", function () {
			let result = isColumnsValid([]);
			expect(result).to.equal(false);
		});

		it("should return false if query key id are different", function () {
			let columns = ["courses_avg", "courses2_dept"];
			expect(isColumnsValid(columns)).to.equal(true);
		});

		it("should return false if query keys is is not an added dataset", function () {
			let columns = ["courses_avg", "courses_dept"];
			expect(isColumnsValid(columns)).to.equal(true);
		});

		it("should return false if query key fields are not valid", function () {
			let columns = ["courses_avg", "courses_dept"];
			expect(isColumnsValid(columns)).to.equal(true);
		});

		it("should return true if query keys are valid", function () {
			let columns = ["courses_avg", "courses_dept"];
			expect(isColumnsValid(columns)).to.equal(true);
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
