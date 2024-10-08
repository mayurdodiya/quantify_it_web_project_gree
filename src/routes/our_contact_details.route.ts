import { Request, Response, Router } from "express";
import { addOurContactDetailsValidation, updateOurContactDetailsValidation } from "../utils/express_validator";
import { OurContactDetailsController } from "../controller/our_contact_details/our_contact_details_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const ourContactDetailsController = new OurContactDetailsController();

routes.post("/add",verifyAdminToken, addOurContactDetailsValidation, (req: Request, res: Response) => ourContactDetailsController.addData(req, res));
routes.put("/edit",verifyAdminToken, updateOurContactDetailsValidation, (req: any, res: any) => ourContactDetailsController.updateData(req, res));
routes.get("/get", (req, res) => ourContactDetailsController.getData(req, res));
// routes.delete("/remove/:id", (req, res) => ourContactDetailsController.removeData(req, res));

export default routes;
