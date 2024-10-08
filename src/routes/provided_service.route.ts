import { Request, Response, Router } from "express";
import { addprovidedServiceValidation, updateprovidedServiceValidation } from "../utils/express_validator";
import { ProvidedServiceController } from "../controller/provided_service/provided_service_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const providedServiceController = new ProvidedServiceController();

routes.post("/add",verifyAdminToken, addprovidedServiceValidation, (req: Request, res: Response) => providedServiceController.addData(req, res));
routes.put("/edit/:id",verifyAdminToken, updateprovidedServiceValidation, (req: any, res: any) => providedServiceController.updateData(req, res));
routes.get("/get/:id", (req: any, res: any) => providedServiceController.getData(req, res));
routes.delete("/remove/:id",verifyAdminToken, (req: any, res: any) => providedServiceController.removeData(req, res));
routes.get("/get", (req, res) => providedServiceController.getAllData(req, res));

export default routes;
