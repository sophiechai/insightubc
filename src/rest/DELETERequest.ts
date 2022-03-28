import {Request, Response} from "express";
import {IInsightFacade, InsightError, NotFoundError} from "../controller/IInsightFacade";

export function deleteDatasetHelper(req: Request, res: Response, facade: IInsightFacade) {
	try {
		checkIdValid(req.params.id);
		facade.removeDataset(req.params.id)
			.then((response) => {
				res.status(200).json({result: response});
			})
			.catch((err) => {
				if (err instanceof NotFoundError) {
					res.status(404).json({error: err.message});
				} else {
					res.status(400).json({error: err.message});
				}
			});
	} catch (err: any) {
		res.status(400).json({error: err.message});
	}
}

function checkIdValid(id: string) {
	if (typeof id === "undefined" || id === null) {
		throw new InsightError("Invalid id in DELETE request");
	}
}
