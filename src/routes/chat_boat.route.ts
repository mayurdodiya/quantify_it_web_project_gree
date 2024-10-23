import { Request, Response, Router } from "express";
import { verifyAdminToken } from "../utils/auth.token";
import { ChatBoatController } from "../controller/chat_boat/chat_boat_controller";
import { pageAndSizeQueryValidation } from "../utils/express_validator";

const routes = Router();
const chatBoatController = new ChatBoatController();

routes.get("/get", verifyAdminToken, pageAndSizeQueryValidation, (req: Request, res: Response) => chatBoatController.getAllUserChat(req, res));
routes.post("/replay", (req: Request, res: Response) => chatBoatController.addreplayToUser(req, res));

routes.get("/lastmsg", verifyAdminToken, (req: Request, res: Response) => chatBoatController.getAllUserLastMSG(req, res));
routes.get("/get/:id", (req: Request, res: Response) => chatBoatController.getUserChatById(req, res));

export default routes;
