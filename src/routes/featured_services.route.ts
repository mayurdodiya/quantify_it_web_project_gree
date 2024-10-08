import { Request, Response, Router } from "express";
import { addfeaturedServicesValidation, updatefeaturedServicesValidation } from "../utils/express_validator";
import { FeaturedServicesController } from "../controller/featured_services/featured_services_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const featuredServicesController = new FeaturedServicesController();

routes.post("/add",verifyAdminToken, addfeaturedServicesValidation, (req: Request, res: Response) => featuredServicesController.addData(req, res));
routes.put("/edit/:id",verifyAdminToken, updatefeaturedServicesValidation, (req: any, res: any) => featuredServicesController.updateData(req, res));
routes.get("/get/:id", (req: any, res: any) => featuredServicesController.getData(req, res));
routes.get("/get", (req, res) => featuredServicesController.getAllData(req, res));
routes.delete("/remove/:id",verifyAdminToken, (req: any, res: any) => featuredServicesController.removeData(req, res));

export default routes;
