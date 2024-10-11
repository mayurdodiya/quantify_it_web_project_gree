import { Request, Response, Router } from "express";
import { addEmployeeDetailsValidation, pageAndSizeQueryValidation, updateEmployeeDetailsValidation } from "../utils/express_validator";
import { EmployeeDetailsController } from "../controller/employee_details/employee_details_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const employeeDetailsController = new EmployeeDetailsController();

routes.post("/add", verifyAdminToken, addEmployeeDetailsValidation, (req: Request, res: Response) => employeeDetailsController.addEmployeeDetails(req, res));
routes.put("/edit/:id", verifyAdminToken, updateEmployeeDetailsValidation, (req: Request, res: Response) => employeeDetailsController.updateEmployeeDetails(req, res));
routes.get("/get/:id", (req: Request, res: Response) => employeeDetailsController.getEmployeeDetails(req, res));
routes.get("/get", pageAndSizeQueryValidation, (req: Request, res: Response) => employeeDetailsController.getAllEmployeeDetails(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => employeeDetailsController.removeEmployeeDetails(req, res));

export default routes;
