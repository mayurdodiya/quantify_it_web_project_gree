import { Request, Response, Router } from "express";
import { addCoreServiceValidation, pageAndSizeQueryValidation } from "../utils/express_validator";
import { CoreServicesController } from "../controller/core_services/core_services_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const coreServiceController = new CoreServicesController();

routes.post("/add", verifyAdminToken, addCoreServiceValidation, (req: Request, res: Response) => coreServiceController.addCoreServices(req, res));
routes.put("/edit/:id", verifyAdminToken, (req: Request, res: Response) => coreServiceController.updateCoreServices(req, res));
routes.get("/get/:id", (req: Request, res: Response) => coreServiceController.getCoreServices(req, res));
routes.get("/get", pageAndSizeQueryValidation, (req: Request, res: Response) => coreServiceController.getAllCoreServices(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => coreServiceController.removeCoreServices(req, res));

export default routes;
