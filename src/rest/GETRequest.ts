import {Request, Response} from "express";
import {IInsightFacade} from "../controller/IInsightFacade";

export function getDatasetsHelper(req: Request, res: Response, facade: IInsightFacade) {
	try {
		facade.listDatasets()
			.then((response) => {
				res.status(200).json({result: response});
			});
	} catch (err: any) {
		res.status(400).json({error: err.message});
	}
}
