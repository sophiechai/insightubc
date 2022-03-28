import Server from "../../src/rest/Server";
import {expect, request, use} from "chai";
import chaiHttp from "chai-http";
import {clearDisk, serverGetContentFromArchives} from "../TestUtil";

describe("Facade D3", function () {
	this.timeout(10000);
	let server: Server;
	const SERVER_URL = "localhost:4321";
	const contentType = "Content-Type";
	const typeJson = "application/json";
	const typeZip = "application/x-zip-compressed";

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
		// clearDisk();
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
		describe("COURSES DATASET", function () {
			it("PUT for courses dataset - valid", function () {
				try {
					return request(SERVER_URL)
						.put("/dataset/mycourses/courses")
						.send(serverGetContentFromArchives("courses.zip"))
						.set(contentType, typeZip)
						.then(function (res: ChaiHttp.Response) {
							expect(res.status).to.be.equal(200);
							expect(res.body).to.haveOwnProperty("result");
							expect(res.body.result).to.deep.equal(["mycourses"]);
						})
						.catch(function (err) {
							console.log(err);
							expect.fail();
						});
				} catch (err) {
					// console.log(err);
					expect.fail();
				}
			});

			// it("PUT for courses dataset - invalid repeat id", function () {
			// 	try {
			// 		return request(SERVER_URL)
			// 			.put("/dataset/mycourses/courses")
			// 			.send(serverGetContentFromArchives("courses.zip"))
			// 			.set(contentType, typeZip)
			// 			.then(function (res: ChaiHttp.Response) {
			// 				expect(res.status).to.be.equal(200);
			// 				return request(SERVER_URL)
			// 					.put("/dataset/mycourses/courses")
			// 					.send(serverGetContentFromArchives("courses.zip"))
			// 					.set(contentType, typeZip)
			// 					.then(function (res2: ChaiHttp.Response) {
			// 						expect(res2.status).to.be.equal(400);
			// 						expect(res2.body.error).to.be.equal("Invalid id");
			// 					});
			// 			})
			// 			.catch(function (err) {
			// 				console.log(err);
			// 				expect.fail();
			// 			});
			// 	} catch (err) {
			// 		// console.log(err);
			// 		expect.fail();
			// 	}
			// });

			it("PUT for courses dataset - invalid repeat id", function () {
				try {
					return request(SERVER_URL)
						.put("/dataset/mycourses/courses")
						.send(serverGetContentFromArchives("courses.zip"))
						.set(contentType, typeZip)
						.then(function (res: ChaiHttp.Response) {
							expect(res.status).to.be.equal(400);
							expect(res.body).to.haveOwnProperty("error");
							expect(res.body.error).to.equal("Invalid id");
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
						.set(contentType, typeZip)
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

			it("PUT for courses - invalid id whitespace", function () {
				try {
					return request(SERVER_URL)
						.put("/dataset/ /courses")
						.send(serverGetContentFromArchives("courses.zip"))
						.set(contentType, typeZip)
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

			it("PUT for courses - invalid kind", function () {
				try {
					return request(SERVER_URL)
						.put("/dataset/mycourses/course")
						.send(serverGetContentFromArchives("courses.zip"))
						.set(contentType, typeZip)
						.then(function (res: ChaiHttp.Response) {
							expect(res.status).to.be.equal(400);
							expect(res.body).to.haveOwnProperty("error");
							expect(res.body.error).to.equal("Invalid kind");
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
		});

		describe("ROOMS DATASET", function () {
			it("PUT for rooms dataset - valid", function () {
				try {
					return request(SERVER_URL)
						.put("/dataset/rooms/rooms")
						.send(serverGetContentFromArchives("rooms.zip"))
						.set(contentType, typeZip)
						.then(function (res: ChaiHttp.Response) {
							expect(res.status).to.be.equal(200);
							expect(res.body).to.haveOwnProperty("result");
							expect(res.body.result).to.deep.equal(["mycourses", "rooms"]);
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

			// it("PUT for rooms dataset - invalid repeat id", function () {
			// 	try {
			// 		return request(SERVER_URL)
			// 			.put("/dataset/rooms/rooms")
			// 			.send(serverGetContentFromArchives("rooms_small.zip"))
			// 			.set(contentType, typeZip)
			// 			.then(function (res: ChaiHttp.Response) {
			// 				expect(res.status).to.be.equal(200);
			// 				return request(SERVER_URL)
			// 					.put("/dataset/rooms/rooms")
			// 					.send(serverGetContentFromArchives("rooms_small.zip"))
			// 					.set(contentType, typeZip)
			// 					.then(function (res2: ChaiHttp.Response) {
			// 						expect(res.status).to.be.equal(400);
			// 						expect(res.body.error).to.equal("Invalid id");
			// 					});
			// 			})
			// 			.catch(function (err) {
			// 				console.log(err);
			// 				expect.fail();
			// 			});
			// 	} catch (err) {
			// 		// console.log(err);
			// 		expect.fail();
			// 	}
			// });

			it("PUT for rooms dataset - invalid repeat id", function () {
				try {
					return request(SERVER_URL)
						.put("/dataset/rooms/rooms")
						.send(serverGetContentFromArchives("rooms.zip"))
						.set(contentType, typeZip)
						.then(function (res: ChaiHttp.Response) {
							expect(res.status).to.be.equal(400);
							expect(res.body).to.haveOwnProperty("error");
							expect(res.body.error).to.equal("Invalid id");
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

			it("PUT for rooms - invalid id with underscore", function () {
				try {
					return request(SERVER_URL)
						.put("/dataset/ubc_rooms/rooms")
						.send(serverGetContentFromArchives("rooms.zip"))
						.set(contentType, typeZip)
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

			it("PUT for rooms - invalid id whitespace", function () {
				try {
					return request(SERVER_URL)
						.put("/dataset/ /rooms")
						.send(serverGetContentFromArchives("rooms.zip"))
						.set(contentType, typeZip)
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

			it("PUT for rooms - invalid kind", function () {
				try {
					return request(SERVER_URL)
						.put("/dataset/ubc rooms/room")
						.send(serverGetContentFromArchives("rooms.zip"))
						.set(contentType, typeZip)
						.then(function (res: ChaiHttp.Response) {
							expect(res.status).to.be.equal(400);
							expect(res.body).to.haveOwnProperty("error");
							expect(res.body.error).to.equal("Invalid kind");
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
		});
	});

	describe("POST Request Tests", function () {
		describe("COURSES DATASET", function () {
			it("simple query - valid", function () {
				let query = {
					WHERE: {
						AND: [
							{
								IS: {
									mycourses_dept: "cpsc"
								}
							},
							{
								EQ: {
									mycourses_avg: 95
								}
							}
						]
					},
					OPTIONS: {
						COLUMNS: [
							"mycourses_dept",
							"mycourses_id",
							"mycourses_avg"
						]
					}
				};
				return request(SERVER_URL)
					.post("/query")
					.send(query)
					.set(contentType, typeJson)
					.then((res) => {
						expect(res.status).to.be.equal(200);
						expect(res.body.result).to.have.length(2);
						expect(res.body.result).to.deep.equal(
							[
								{
									mycourses_dept: "cpsc",
									mycourses_id: "589",
									mycourses_avg: 95
								},
								{
									mycourses_dept: "cpsc",
									mycourses_id: "589",
									mycourses_avg: 95
								}
							]
						);
					});
			});
		});

		describe("ROOMS DATASET", function () {
			it("simple query - valid", function () {
				let query =
					{
						WHERE: {
							AND: [{
								IS: {
									rooms_furniture: "*Tables*"
								}
							}, {
								GT: {
									rooms_seats: 300
								}
							}]
						},
						OPTIONS: {
							COLUMNS: [
								"rooms_shortname",
								"maxSeats"
							],
							ORDER: {
								dir: "DOWN",
								keys: ["maxSeats"]
							}
						},
						TRANSFORMATIONS: {
							GROUP: ["rooms_shortname"],
							APPLY: [{
								maxSeats: {
									MAX: "rooms_seats"
								}
							}]
						}
					};
				let result =
					[
						{
							rooms_shortname: "OSBO",
							maxSeats: 442
						},
						{
							rooms_shortname: "HEBB",
							maxSeats: 375
						},
						{
							rooms_shortname: "LSC",
							maxSeats: 350
						}
					];
				return request(SERVER_URL)
					.post("/query")
					.send(query)
					.set(contentType, typeJson)
					.then((res) => {
						expect(res.status).to.equal(200);
						expect(res.body.result).to.deep.equal(result);
					});
			});
		});
	});
});
