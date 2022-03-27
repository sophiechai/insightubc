import {Request, Response} from "express";
import {IInsightFacade, InsightError} from "../controller/IInsightFacade";

export function postQueryHelper(req: Request, res: Response, facade: IInsightFacade) {
	try {
		checkValueValid(req.body);
		facade
			.performQuery(req.body)
			.then((response) => {
				res.status(200).json({result: response});
			})
			.catch((err) => {
				res.status(400).json({error: err.message});
			});
	} catch (err: any) {
		res.status(400).json({error: err.message});
	}
}

function checkValueValid(query: any) {
	if (typeof query === "undefined" || query === null) {
		throw new InsightError("Invalid POST body");
	}
}
