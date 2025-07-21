import { Router } from "express";

const coursesRouter = Router();

coursesRouter.route("/courses")
	.get()
	.post();

coursesRouter.route("/courses/:id")
	.put()
	.delete();

export default coursesRouter;