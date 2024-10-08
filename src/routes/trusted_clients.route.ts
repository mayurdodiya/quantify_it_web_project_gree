import { Request, Response, Router } from "express";
import { pageAndSizeQueryValidation, addTrustedClientsValidation, updateTrustedClientsValidation } from "../utils/express_validator";
import { TrustedClientsController } from "../controller/trusted_clients/trusted_clients_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const trustedClientsController = new TrustedClientsController();

routes.post("/add", verifyAdminToken, addTrustedClientsValidation, (req: Request, res: Response) => trustedClientsController.addTrustedClients(req, res));
routes.put("/edit/:id", verifyAdminToken, updateTrustedClientsValidation, (req: Request, res: Response) => trustedClientsController.updateTrustedClients(req, res));
routes.get("/get/:id", (req: Request, res: Response) => trustedClientsController.getTrustedClients(req, res));
routes.get("/get", pageAndSizeQueryValidation, (req: Request, res: Response) => trustedClientsController.getAllTrustedClients(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => trustedClientsController.removeTrustedClients(req, res));

export default routes;
