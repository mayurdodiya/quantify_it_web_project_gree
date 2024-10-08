import { Request, Response, Router } from "express";
import { addSubServiceValidation, updateSubServiceValidation } from "../utils/express_validator";
import { SubServicesController } from "../controller/sub_services/sub_services_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const subServiceController = new SubServicesController();

routes.post("/add", verifyAdminToken, addSubServiceValidation, (req: Request, res: Response) => subServiceController.addSubServices(req, res));
routes.put("/edit/:id", verifyAdminToken, updateSubServiceValidation, (req: Request, res: Response) => subServiceController.updateSubServices(req, res));
routes.get("/get/:id", (req: Request, res: Response) => subServiceController.getSubServices(req, res));
routes.get("/get", (req, res) => subServiceController.getAllSubServices(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => subServiceController.removeSubServices(req, res));

export default routes;
