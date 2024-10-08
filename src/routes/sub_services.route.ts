import { Request, Response, Router } from "express";
import { addSubServiceValidation, updateSubServiceValidation } from "../utils/express_validator";
import { SubServicesController } from "../controller/sub_services/sub_services_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const subServiceController = new SubServicesController();

routes.post("/add",verifyAdminToken, addSubServiceValidation, (req: Request, res: Response) => subServiceController.addData(req, res));
routes.put("/edit/:id",verifyAdminToken, updateSubServiceValidation, (req: any, res: any) => subServiceController.updateData(req, res));
routes.get("/get/:id", (req: any, res: any) => subServiceController.getData(req, res));
routes.get("/get", (req, res) => subServiceController.getAllData(req, res));
routes.delete("/remove/:id",verifyAdminToken, (req: any, res: any) => subServiceController.removeData(req, res));

export default routes;
