import { Request, Response, Router } from "express";
import { addblogValidation, updateblogValidation, pageAndSizeQueryValidation } from "../utils/express_validator";
import { BlogController } from "../controller/blog/blog_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const blogController = new BlogController();

routes.post("/add", verifyAdminToken, addblogValidation, (req: Request, res: Response) => blogController.addBlog(req, res));
routes.put("/edit/:id", verifyAdminToken, updateblogValidation, (req: Request, res: Response) => blogController.updateBlog(req, res));
routes.get("/get/:id", (req: Request, res: Response) => blogController.getBlog(req, res));
routes.get("/get", pageAndSizeQueryValidation, (req: Request, res: Response) => blogController.getAllBlog(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => blogController.removeBlog(req, res));

export default routes;
