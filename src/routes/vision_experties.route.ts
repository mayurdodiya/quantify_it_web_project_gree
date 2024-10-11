import { Request, Response, Router } from "express";
import { addVisionExpertiesValidation, updateVisionExpertiesValidation } from "../utils/express_validator";
import { VisionExpertiesController } from "../controller/vision_experties/vision_experties_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const visionExpertiesController = new VisionExpertiesController();

routes.post("/add", verifyAdminToken, addVisionExpertiesValidation, (req: Request, res: Response) => visionExpertiesController.addVisionExperties(req, res));
routes.put("/edit/:id", verifyAdminToken, updateVisionExpertiesValidation, (req: Request, res: Response) => visionExpertiesController.updateVisionExperties(req, res));
routes.get("/get/:id", (req: Request, res: Response) => visionExpertiesController.getVisionExperties(req, res));
routes.get("/get", (req, res) => visionExpertiesController.getAllVisionExperties(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => visionExpertiesController.removeVisionExperties(req, res));

export default routes;
