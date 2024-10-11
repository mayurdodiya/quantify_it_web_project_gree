import { Request, Response, Router } from "express";
import { addHowWeWorkValidation, pageAndSizeQueryValidation, updateHowWeWorkValidation } from "../utils/express_validator";
import { HowWeWorkController } from "../controller/how_we_work/how_we_work_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const howWeWorkController = new HowWeWorkController();

routes.post("/add", verifyAdminToken, addHowWeWorkValidation, (req: Request, res: Response) => howWeWorkController.addHowWeWork(req, res));
routes.put("/edit/:id", verifyAdminToken, updateHowWeWorkValidation, (req: Request, res: Response) => howWeWorkController.updateHowWeWork(req, res));
routes.get("/get/:id", (req: Request, res: Response) => howWeWorkController.getHowWeWork(req, res));
routes.get("/get", pageAndSizeQueryValidation,(req: Request, res: Response) => howWeWorkController.getAllHowWeWork(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => howWeWorkController.removeHowWeWork(req, res));

export default routes;
