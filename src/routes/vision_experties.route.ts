import { Request, Response, Router } from "express";
import { addVisionExpertiesValidation, updateVisionExpertiesValidation } from "../utils/express_validator";
import { VisionExpertiesController } from "../controller/vision_experties/vision_experties_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const visionExpertiesController = new VisionExpertiesController();

routes.post("/add",verifyAdminToken, addVisionExpertiesValidation, (req: Request, res: Response) => visionExpertiesController.addData(req, res));
routes.put("/edit/:id",verifyAdminToken, updateVisionExpertiesValidation, (req: any, res: any) => visionExpertiesController.updateData(req, res));
routes.get("/get/:id", (req: any, res: any) => visionExpertiesController.getData(req, res));
routes.get("/get", (req, res) => visionExpertiesController.getAllData(req, res));
routes.delete("/remove/:id",verifyAdminToken, (req: any, res: any) => visionExpertiesController.removeData(req, res));

export default routes;
