import { Request, Response, Router } from "express";
import { verifyAdminToken } from "../utils/auth.token";
import { addOurContactDetailsValidation, updateOurContactDetailsValidation } from "../utils/express_validator";
import { OurContactDetailsController } from "../controller/our_contact_details/our_contact_details_controller";

const routes = Router();
const ourContactDetailsController = new OurContactDetailsController();

routes.post("/add", verifyAdminToken, addOurContactDetailsValidation, (req: Request, res: Response) => ourContactDetailsController.addOurContactDetails(req, res));
routes.put("/edit", verifyAdminToken, updateOurContactDetailsValidation, (req: Request, res: Response) => ourContactDetailsController.updateOurContactDetails(req, res));
routes.get("/get", (req, res) => ourContactDetailsController.getOurContactDetails(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req, res) => ourContactDetailsController.removeContactDetails(req, res));

export default routes;
