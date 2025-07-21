import { Request, Response } from "express";

const register = (_req: Request, res: Response) => {
	res.sendStatus(200);
};

export default {
	register
};