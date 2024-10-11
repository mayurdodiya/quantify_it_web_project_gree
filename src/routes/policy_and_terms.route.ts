import { Request, Response, Router } from "express";
import { addPolicyAndTermsValidation, updatePolicyAndTermsValidation, policyAndTermsQueryValidation, pageAndSizeQueryValidation } from "../utils/express_validator";
import { PolicyAndTermsController } from "../controller/policy_and_terms/policy_and_terms_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const policyAndTermsController = new PolicyAndTermsController();

routes.post("/add", verifyAdminToken, addPolicyAndTermsValidation, (req: Request, res: Response) => policyAndTermsController.addPolicyAndTerms(req, res));
routes.put("/edit/:id", verifyAdminToken, updatePolicyAndTermsValidation, (req: Request, res: Response) => policyAndTermsController.updatePolicyAndTerms(req, res));
routes.get("/get/:id", (req: Request, res: Response) => policyAndTermsController.getPolicyAndTerms(req, res));
routes.get("/get", policyAndTermsQueryValidation,pageAndSizeQueryValidation, (req: Request, res: Response) => policyAndTermsController.getAllPolicyAndTerms(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => policyAndTermsController.removePolicyAndTerms(req, res));

export default routes;
