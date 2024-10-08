import { Request, Response, Router } from "express";
import { addHowWeWorkValidation, updateHowWeWorkValidation } from "../utils/express_validator";
import { HowWeWorkController } from "../controller/how_we_work/how_we_work_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const howWeWorkController = new HowWeWorkController();

routes.post("/add", verifyAdminToken, addHowWeWorkValidation, (req: Request, res: Response) => howWeWorkController.addData(req, res));
routes.put("/edit/:id", verifyAdminToken, updateHowWeWorkValidation, (req: Request, res: Response) => howWeWorkController.updateData(req, res));
routes.get("/get/:id", (req: Request, res: Response) => howWeWorkController.getData(req, res));
routes.get("/get", (req, res) => howWeWorkController.getAllData(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => howWeWorkController.removeData(req, res));

export default routes;
