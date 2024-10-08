import { Request, Response, Router } from "express";
import { addblogValidation, updateblogValidation, pageAndSizeQueryValidation } from "../utils/express_validator";
import { BlogController } from "../controller/blog/blog_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const blogController = new BlogController();

routes.post("/add",verifyAdminToken, addblogValidation, (req: Request, res: Response) => blogController.addData(req, res));
routes.put("/edit/:id",verifyAdminToken, updateblogValidation, (req: any, res: any) => blogController.updateData(req, res));
routes.get("/get/:id", (req: any, res: any) => blogController.getData(req, res));
routes.get("/get", pageAndSizeQueryValidation, (req: any, res: any) => blogController.getAllData(req, res));
routes.delete("/remove/:id",verifyAdminToken, (req: any, res: any) => blogController.removeData(req, res));

export default routes;
