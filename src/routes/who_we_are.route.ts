import { Request, Response, Router } from "express";
import { addWhoWeAreValidation, updateWhoWeAreValidation } from "../utils/express_validator";
import { verifyAdminToken } from "../utils/auth.token";
import { WhoWeAreController } from "../controller/who_we_are/who_we_are_controller";

const routes = Router();
const whoWeAreController = new WhoWeAreController();

routes.post("/add", verifyAdminToken, addWhoWeAreValidation, (req: Request, res: Response) => whoWeAreController.addWhoWeAre(req, res));
routes.put("/edit/:id", verifyAdminToken, updateWhoWeAreValidation, (req: Request, res: Response) => whoWeAreController.updateWhoWeAre(req, res));
routes.get("/get/ideaexperience", (req, res) => whoWeAreController.getIdeasExperienceData(req, res));
routes.get("/get/:id", (req: Request, res: Response) => whoWeAreController.getWhoWeAre(req, res));
routes.get("/get", (req, res) => whoWeAreController.getAllWhoWeAre(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => whoWeAreController.removeWhoWeAre(req, res));

export default routes;
