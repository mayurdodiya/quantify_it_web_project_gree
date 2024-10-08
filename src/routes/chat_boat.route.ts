import { Request, Response, Router } from "express";
import { ChatBoatController } from "../controller/chat_boat/chat_boat_controller";

const routes = Router();
const chatBoatController = new ChatBoatController();

routes.get("/get/:id", (req: Request, res: Response) => chatBoatController.getUserChatById(req, res));
routes.get("/get", (req: Request, res: Response) => chatBoatController.getAllUserChat(req, res));
routes.post("/replay", (req: Request, res: Response) => chatBoatController.addreplayToUser(req, res));

export default routes;
