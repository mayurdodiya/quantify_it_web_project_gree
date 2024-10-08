import { Request, Response, Router } from "express";
import { addQuestionAnsValidation } from "../utils/express_validator";
import { QuestionAnsController } from "../controller/question_ans/question_ans_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const questionAnsController = new QuestionAnsController();

routes.post("/add", verifyAdminToken, addQuestionAnsValidation, (req: Request, res: Response) => questionAnsController.addData(req, res));
routes.put("/edit/:id", verifyAdminToken, (req: Request, res: Response) => questionAnsController.updateData(req, res));
routes.get("/get/:id", (req: Request, res: Response) => questionAnsController.getData(req, res));
routes.get("/get", (req, res) => questionAnsController.getAllData(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => questionAnsController.removeData(req, res));

export default routes;
