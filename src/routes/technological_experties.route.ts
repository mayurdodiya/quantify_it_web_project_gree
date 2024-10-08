import { Request, Response, Router } from "express";
import { addTechExpertiesValidation } from "../utils/express_validator";
import { TechnologicalExpertiesController } from "../controller/technological_experties/technological_experties_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const technologicalExpertiesController = new TechnologicalExpertiesController();

routes.post("/add",verifyAdminToken, addTechExpertiesValidation, (req: Request, res: Response) => technologicalExpertiesController.addData(req, res));
routes.put("/edit/:id",verifyAdminToken, (req: any, res: any) => technologicalExpertiesController.updateData(req, res));
routes.get("/get/:id", (req: any, res: any) => technologicalExpertiesController.getData(req, res));
routes.get("/get", (req, res) => technologicalExpertiesController.getAllData(req, res));
routes.delete("/remove/:id",verifyAdminToken, (req: any, res: any) => technologicalExpertiesController.removeData(req, res));

export default routes;
