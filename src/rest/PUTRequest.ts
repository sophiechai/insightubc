import {Request, Response} from "express";

export function putDataset(req: Request, res: Response) {
	try {
		console.log("Server::putDataset(..) - params: " + JSON.stringify(req.params));
		const reqBody: Buffer = req.body;
		console.log("PUT REQUEST BODY: ", reqBody);
		let reqBodyBase64 = reqBody.toString("base64");
		console.log("BASE64 BODY: ", reqBodyBase64);
		const response = performPut();
		res.status(200).json({result: response});
	} catch (err: any) {
		console.log("putDataset error response: ", err);
		res.status(400).json({error: err.message});
	}
}

function performPut(): string[] {
	return [];
}
