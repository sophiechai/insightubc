import Server from "../../src/rest/Server";
import {expect, request, use} from "chai";
import chaiHttp from "chai-http";
import {clearDisk, serverGetContentFromArchives} from "../TestUtil";

describe("Facade D3", function () {
	this.timeout(10000);
	let server: Server;
	const SERVER_URL = "localhost:4321";

	use(chaiHttp);

	before(function () {
		clearDisk();
		server = new Server(4321);
		return server
			.start()
			.catch((err: Error) => {
				console.error("TestServer::initServer() - ERROR: ", err.message);
			});
	});

	after(function () {
		return server.stop()
			.catch((err: Error) => {
				console.error("TestServer - ERROR: ", err.message);
			});
	});

	beforeEach(function () {
		// might want to add some process logging here to keep track of what"s going on
	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what"s going on
	});

	// Sample on how to format PUT requests
	/*
	it("PUT test for courses dataset", function () {
		try {
			return chai.request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});
	*/

	// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation

	describe("PUT Request Tests", function () {
		it("PUT for courses dataset - valid", function () {
			try {
				return request(SERVER_URL)
					.put("/dataset/mycourses/courses")
					.send(serverGetContentFromArchives("courses.zip"))
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: ChaiHttp.Response) {
						expect(res.status).to.be.equal(200);
						expect(res.body).to.haveOwnProperty("result");
						expect(res.body.result).to.deep.equal(["mycourses"]);
					})
					.catch(function (err) {
						// console.log(err);
						expect.fail();
					});
			} catch (err) {
				// console.log(err);
				expect.fail();
			}
		});

		it("PUT for courses - invalid id with underscore", function () {
			try {
				return request(SERVER_URL)
					.put("/dataset/my_courses/courses")
					.send(serverGetContentFromArchives("courses.zip"))
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: ChaiHttp.Response) {
						expect(res.status).to.be.equal(400);
						expect(res.body).to.haveOwnProperty("error");
						expect(res.body.error).to.equal("Invalid id");
						// console.log("res.body.error", res.body.error);
					})
					.catch(function (err) {
						// console.log("ERR", err);
						expect.fail();
					});
			} catch (err) {
				expect.fail();
			}
		});

		it("PUT for courses dataset", function () {
			try {
				return request(SERVER_URL)
					.put("/dataset/mycourses/courses")
					.send(serverGetContentFromArchives("courses.zip"))
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: ChaiHttp.Response) {
						// some logging
						expect(res.status).to.be.equal(200);
						expect(res.body).to.haveOwnProperty("result");
						expect(res.body.result).to.deep.equal(["mycourses"]);
					})
					.catch(function (err) {
						// some logging
						// console.log(err);
						expect.fail();
					});
			} catch (err) {
				// some logging
				console.log(err);
				expect.fail();
			}
		});
	});
});
