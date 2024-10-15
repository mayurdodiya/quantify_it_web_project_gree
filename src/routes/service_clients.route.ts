import { Request, Response, Router } from "express";
import { pageAndSizeQueryValidation, updateServicesClientsValidation, addServicesClientsValidation } from "../utils/express_validator";
import { ServiceClientsController } from "../controller/service_clients/service_clients_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const serviceClientsController = new ServiceClientsController();

routes.post("/add", verifyAdminToken, addServicesClientsValidation, (req: Request, res: Response) => serviceClientsController.addServiceClients(req, res));
routes.put("/edit/:id", verifyAdminToken, updateServicesClientsValidation, (req: Request, res: Response) => serviceClientsController.updateServiceClients(req, res));
routes.get("/get/:id", (req: Request, res: Response) => serviceClientsController.getServiceClients(req, res));
routes.get("/get", pageAndSizeQueryValidation, (req: Request, res: Response) => serviceClientsController.getAllServiceClients(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => serviceClientsController.removeServiceClients(req, res));

export default routes;
