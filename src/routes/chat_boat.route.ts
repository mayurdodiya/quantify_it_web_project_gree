import { Request, Response, Router } from "express";
import { addblogValidation, updateblogValidation, pageAndSizeQueryValidation } from "../utils/express_validator";
import { verifyAdminToken } from "../utils/auth.token";
import { ChatBoatController } from "../controller/chat_boat/chat_boat_controller";

const routes = Router();
const chatBoatController = new ChatBoatController();

routes.get("/get/:id", (req: Request, res: Response) => chatBoatController.getUserChatById(req, res));
routes.get("/get", (req: Request, res: Response) => chatBoatController.getAllUserChat(req, res));
routes.post("/replay", (req: Request, res: Response) => chatBoatController.addreplayToUser(req, res));

export default routes;
