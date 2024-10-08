import { Request, Response, Router } from "express";
import { addfeaturedServicesValidation, updatefeaturedServicesValidation } from "../utils/express_validator";
import { FeaturedServicesController } from "../controller/featured_services/featured_services_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const featuredServicesController = new FeaturedServicesController();

routes.post("/add", verifyAdminToken, addfeaturedServicesValidation, (req: Request, res: Response) => featuredServicesController.addFeaturedServices(req, res));
routes.put("/edit/:id", verifyAdminToken, updatefeaturedServicesValidation, (req: Request, res: Response) => featuredServicesController.updateFeaturedServices(req, res));
routes.get("/get/:id", (req: Request, res: Response) => featuredServicesController.getFeaturedServices(req, res));
routes.get("/get", (req, res) => featuredServicesController.getAllFeaturedServices(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => featuredServicesController.removeFeaturedServices(req, res));

export default routes;
