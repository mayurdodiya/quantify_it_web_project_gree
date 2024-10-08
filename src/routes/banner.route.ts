import express, { NextFunction } from "express";
import { verifyAdminToken } from "../utils/auth.token";
import { BannerController } from "../controller/banner/banner_controller";
import { addBannerValidation, updateBannerValidation } from "../utils/express_validator";

const routes = express.Router();
const bannerController = new BannerController();

// routes.post("/addbanner", bannerController.CreateBanner.bind(bannerController));
routes.post("/add", verifyAdminToken, addBannerValidation, (req: any, res: any) => bannerController.createBanner(req, res));
routes.put("/edit/:id", verifyAdminToken, updateBannerValidation, (req: any, res: any) => bannerController.updateBanner(req, res));
routes.get("/get/:id", (req: any, res: any) => bannerController.getBanner(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: any, res: any) => bannerController.removeData(req, res));

export default routes;
