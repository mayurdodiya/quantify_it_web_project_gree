import { Request, Response, Router } from "express";
import { addprovidedServiceValidation, updateprovidedServiceValidation } from "../utils/express_validator";
import { ProvidedServiceController } from "../controller/provided_service/provided_service_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const providedServiceController = new ProvidedServiceController();

routes.post("/add", verifyAdminToken, addprovidedServiceValidation, (req: Request, res: Response) => providedServiceController.addProvidedService(req, res));
routes.put("/edit/:id", verifyAdminToken, updateprovidedServiceValidation, (req: Request, res: Response) => providedServiceController.updateProvidedService(req, res));
routes.get("/get/:id", (req: Request, res: Response) => providedServiceController.getProvidedService(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => providedServiceController.removeProvidedService(req, res));
routes.get("/get", (req, res) => providedServiceController.getAllProvidedService(req, res));

export default routes;
