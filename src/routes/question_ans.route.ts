import { Request, Response, Router } from "express";
import { addQuestionAnsValidation } from "../utils/express_validator";
import { QuestionAnsController } from "../controller/question_ans/question_ans_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const questionAnsController = new QuestionAnsController();

routes.post("/add", verifyAdminToken, addQuestionAnsValidation, (req: Request, res: Response) => questionAnsController.addQuestionAns(req, res));
routes.put("/edit/:id", verifyAdminToken, (req: Request, res: Response) => questionAnsController.updateQuestionAns(req, res));
routes.get("/get/:id", (req: Request, res: Response) => questionAnsController.getQuestionAns(req, res));
routes.get("/get", (req, res) => questionAnsController.getAllQuestionAns(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => questionAnsController.removeQuestionAns(req, res));

export default routes;
