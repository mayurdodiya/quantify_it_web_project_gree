import { Request, Response, Router } from "express";
import { addPortfolioTypeValidation, pageAndSizeQueryValidation } from "../utils/express_validator";
import { verifyAdminToken } from "../utils/auth.token";
import { PortfolioTypeController } from "../controller/portfolio_type/portfolio_type_controller";

const routes = Router();
const portfolioTypeController = new PortfolioTypeController();

routes.post("/add", verifyAdminToken, addPortfolioTypeValidation, (req: Request, res: Response) => portfolioTypeController.addPortfolioType(req, res));
routes.put("/edit/:id", verifyAdminToken, (req: Request, res: Response) => portfolioTypeController.updatePortfolioType(req, res));
routes.get("/get/:id", (req: Request, res: Response) => portfolioTypeController.getPortfolioType(req, res));
routes.get("/get", pageAndSizeQueryValidation, (req: Request, res: Response) => portfolioTypeController.getAllPortfolioType(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => portfolioTypeController.removePortfolioType(req, res));

export default routes;
