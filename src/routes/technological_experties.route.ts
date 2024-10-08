import { Request, Response, Router } from "express";
import { addTechExpertiesValidation } from "../utils/express_validator";
import { TechnologicalExpertiesController } from "../controller/technological_experties/technological_experties_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const technologicalExpertiesController = new TechnologicalExpertiesController();

routes.post("/add", verifyAdminToken, addTechExpertiesValidation, (req: Request, res: Response) => technologicalExpertiesController.addTechnologicalExperties(req, res));
routes.put("/edit/:id", verifyAdminToken, (req: Request, res: Response) => technologicalExpertiesController.updateTechnologicalExperties(req, res));
routes.get("/get/:id", (req: Request, res: Response) => technologicalExpertiesController.getTechnologicalExperties(req, res));
routes.get("/get", (req, res) => technologicalExpertiesController.getAllTechnologicalExperties(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => technologicalExpertiesController.removeTechnologicalExperties(req, res));

export default routes;
