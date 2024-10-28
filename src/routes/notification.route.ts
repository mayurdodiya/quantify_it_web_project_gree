import { Request, Response, Router } from "express";
import { changeStatusNotificationValidation } from "../utils/express_validator";
import { verifyAdminToken } from "../utils/auth.token";
import { NotificationController } from "../controller/notification/notification_controller";

const routes = Router();
const notificationController = new NotificationController();

routes.put("/status/:id", changeStatusNotificationValidation, (req: Request, res: Response) => notificationController.notificationStatus(req, res));
routes.get("/get/:id", verifyAdminToken, (req: Request, res: Response) => notificationController.getNotification(req, res));
routes.get("/get", verifyAdminToken, (req: Request, res: Response) => notificationController.getAllNotification(req, res));

export default routes;
