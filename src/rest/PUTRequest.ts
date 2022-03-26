import {Request, Response} from "express";
import {IInsightFacade, InsightDatasetKind, InsightError} from "../controller/IInsightFacade";
import InsightFacade from "../controller/InsightFacade";

export function putDatasetHelper(req: Request, res: Response, facade: IInsightFacade) {
	try {
		console.log("Server::putDataset(..) - params: " + JSON.stringify(req.params));
		const reqBody: Buffer = req.body;
		let reqBodyBase64 = reqBody.toString("base64");
		checkValuesValid(req.params.id, req.params.kind, reqBodyBase64);
		let kind = getInsightDatasetKind(req.params.kind);
		facade.addDataset(req.params.id, reqBodyBase64, kind)
			.then((response) => {
				res.status(200).json({result: response});
			});
	} catch (err) {
		console.log("putDataset error response: ", err);
		res.status(400).json({error: err});
	}
}

function checkValuesValid(id: string, kind: string, content: string) {
	if (typeof id === "undefined" || id === null) {
		throw new InsightError("Missing id");
	} else if (typeof content === "undefined" || content === null) {
		throw new InsightError("Missing content");
	} else if (typeof kind === "undefined" || kind === null) {
		throw new InsightError("Missing kind");
	} else if (kind !== "courses" && kind !== "rooms") {
		throw new InsightError("Invalid kind");
	}
}

function getInsightDatasetKind(kind: string): InsightDatasetKind {
	if (kind === "courses") {
		return InsightDatasetKind.Courses;
	}
	if (kind === "rooms") {
		return InsightDatasetKind.Rooms;
	}
	throw new InsightError("THIS WAS NOT SUPPOSED TO HAPPEN");
}
