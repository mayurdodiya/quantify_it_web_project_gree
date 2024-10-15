import { Request, Response, Router } from "express";
import { addPortfolioValidation, pageAndSizeQueryValidation, updatePortfolioValidation } from "../utils/express_validator";
import { PortfolioController } from "../controller/portfolio/portfolio_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const portfolioController = new PortfolioController();

routes.post("/add", verifyAdminToken, addPortfolioValidation, (req: Request, res: Response) => portfolioController.addPortfolio(req, res));
routes.put("/edit/:id", verifyAdminToken, updatePortfolioValidation, (req: Request, res: Response) => portfolioController.updatePortfolio(req, res));
routes.get("/get/:id", (req: Request, res: Response) => portfolioController.getPortfolio(req, res));
routes.get("/get", pageAndSizeQueryValidation, (req: Request, res: Response) => portfolioController.getAllPortfolio(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => portfolioController.removePortfolio(req, res));

export default routes;
