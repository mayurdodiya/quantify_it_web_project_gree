import { Request, Response, Router } from "express";
import { addCertificationValidation, updateCertificationValidation } from "../utils/express_validator";
import { CertificationDetailsController } from "../controller/certification_details/certification_details_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const certificationDetailsController = new CertificationDetailsController();

routes.post("/add", verifyAdminToken, addCertificationValidation, (req: Request, res: Response) => certificationDetailsController.addCertificationDetails(req, res));
routes.put("/edit/:id", verifyAdminToken, updateCertificationValidation, (req: Request, res: Response) => certificationDetailsController.updateCertificationDetails(req, res));
routes.get("/get/:id", (req: Request, res: Response) => certificationDetailsController.getCertificationDetails(req, res));
routes.get("/get", (req: Request, res: Response) => certificationDetailsController.getAllCertificationDetails(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => certificationDetailsController.removeCertificationDetails(req, res));

export default routes;
