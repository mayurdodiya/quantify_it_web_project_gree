import { Request, Response, Router } from "express";
import { addCertificationValidation, updateCertificationValidation } from "../utils/express_validator";
import { CertificationDetailsController } from "../controller/certification_details/certification_details_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const certificationDetailsController = new CertificationDetailsController();

routes.post("/add",verifyAdminToken, addCertificationValidation, (req: Request, res: Response) => certificationDetailsController.addData(req, res));
routes.put("/edit/:id",verifyAdminToken, updateCertificationValidation, (req: any, res: any) => certificationDetailsController.updateData(req, res));
routes.get("/get/:id", (req: any, res: any) => certificationDetailsController.getData(req, res));
routes.get("/get", (req: any, res: any) => certificationDetailsController.getAllData(req, res));
routes.delete("/remove/:id",verifyAdminToken, (req: any, res: any) => certificationDetailsController.removeData(req, res));

export default routes;
