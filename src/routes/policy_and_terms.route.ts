import { Request, Response, Router } from "express";
import { addPolicyAndTermsValidation, updatePolicyAndTermsValidation, policyAndTermsQueryValidation } from "../utils/express_validator";
import { PolicyAndTermsController } from "../controller/policy_and_terms/policy_and_terms_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const policyAndTermsController = new PolicyAndTermsController();

routes.post("/add", verifyAdminToken, addPolicyAndTermsValidation, (req: Request, res: Response) => policyAndTermsController.addData(req, res));
routes.put("/edit/:id", verifyAdminToken, updatePolicyAndTermsValidation, (req: Request, res: Response) => policyAndTermsController.updateData(req, res));
routes.get("/get/:id", (req: Request, res: Response) => policyAndTermsController.getData(req, res));
routes.get("/get", policyAndTermsQueryValidation, (req: Request, res: Response) => policyAndTermsController.getAllData(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => policyAndTermsController.removeData(req, res));

export default routes;
