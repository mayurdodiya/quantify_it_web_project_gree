import express, { Request, Response } from "express";
import { verifyAdminToken } from "../utils/auth.token";
import { BannerController } from "../controller/banner/banner_controller";
import { addBannerValidation, updateBannerValidation } from "../utils/express_validator";

const routes = express.Router();
const bannerController = new BannerController();

// routes.post("/addbanner", bannerController.CreateBanner.bind(bannerController));
routes.post("/add", verifyAdminToken, addBannerValidation, (req: Request, res: Response) => bannerController.createBanner(req, res));
routes.put("/edit/:id", verifyAdminToken, updateBannerValidation, (req: Request, res: Response) => bannerController.updateBanner(req, res));
routes.get("/get/:id", (req: Request, res: Response) => bannerController.getBanner(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => bannerController.removeData(req, res));

export default routes;
