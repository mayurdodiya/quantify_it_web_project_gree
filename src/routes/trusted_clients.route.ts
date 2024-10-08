import { Request, Response, Router } from "express";
import { addPolicyAndTermsValidation, updatePolicyAndTermsValidation, pageAndSizeQueryValidation } from "../utils/express_validator";
import { TrustedClientsController } from "../controller/trusted_clients/trusted_clients_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const trustedClientsController = new TrustedClientsController();

routes.post("/add",verifyAdminToken, addPolicyAndTermsValidation, (req: Request, res: Response) => trustedClientsController.addData(req, res));
routes.put("/edit/:id",verifyAdminToken, updatePolicyAndTermsValidation, (req: any, res: any) => trustedClientsController.updateData(req, res));
routes.get("/get/:id", (req: any, res: any) => trustedClientsController.getData(req, res));
routes.get("/get", pageAndSizeQueryValidation, (req: any, res: any) => trustedClientsController.getAllData(req, res));
routes.delete("/remove/:id",verifyAdminToken, (req: any, res: any) => trustedClientsController.removeData(req, res));

export default routes;
