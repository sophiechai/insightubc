import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect, request, use} from "chai";
import chaiHttp from "chai-http";
import {serverGetContentFromArchives} from "../TestUtil";

describe("Facade D3", function () {
	let facade: InsightFacade;
	let server: Server;
	const SERVER_URL = "localhost:4321";

	use(chaiHttp);

	before(function () {
		facade = new InsightFacade();
		server = new Server(4321);
		// TODO: start server here once and handle errors properly
		return server
			.start()
			.then(() => {
				console.info("TestServer::initServer() - started");
			})
			.catch((err: Error) => {
				console.error("TestServer::initServer() - ERROR: ", err.message);
			});
	});

	after(function () {
		// TODO: stop server here once!
		return server.stop()
			.then(() => {
				console.info("TestServer - stopped");
			})
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
		it("PUT for courses dataset", function () {
			let result = {result: ["mycourses"]};
			try {
				return request(SERVER_URL)
					.put("/dataset/mycourses/courses")
					.send(serverGetContentFromArchives("courses.zip"))
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: ChaiHttp.Response) {
						// some logging
						expect(res.status).to.be.equal(200);
						expect(res.body).to.be.equal(result);
					})
					.catch(function (err) {
						// some logging
						console.log(err);
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
