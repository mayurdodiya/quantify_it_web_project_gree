import { Request, Response, Router } from "express";
import { addCoreServiceValidation } from "../utils/express_validator";
import { CoreServicesController } from "../controller/core_services/core_services_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const coreServiceController = new CoreServicesController();

routes.post("/add",verifyAdminToken, addCoreServiceValidation, (req: Request, res: Response) => coreServiceController.addData(req, res));
routes.put("/edit/:id",verifyAdminToken, (req: any, res: any) => coreServiceController.updateData(req, res));
routes.get("/get/:id", (req: any, res: any) => coreServiceController.getData(req, res));
routes.get("/get", (req, res) => coreServiceController.getAllData(req, res));
routes.delete("/remove/:id",verifyAdminToken, (req: any, res: any) => coreServiceController.removeData(req, res));

export default routes;
