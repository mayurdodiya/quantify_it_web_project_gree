import { Request, Response, Router } from "express";
import { addEmployeeDetailsValidation, updateEmployeeDetailsValidation } from "../utils/express_validator";
import { EmployeeDetailsController } from "../controller/employee_details/employee_details_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const employeeDetailsController = new EmployeeDetailsController();

routes.post("/add",verifyAdminToken, addEmployeeDetailsValidation, (req: Request, res: Response) => employeeDetailsController.addData(req, res));
routes.put("/edit/:id",verifyAdminToken, updateEmployeeDetailsValidation, (req: any, res: any) => employeeDetailsController.updateData(req, res));
routes.get("/get/:id", (req: any, res: any) => employeeDetailsController.getData(req, res));
routes.get("/get", (req, res) => employeeDetailsController.getAllData(req, res));
routes.delete("/remove/:id",verifyAdminToken, (req: any, res: any) => employeeDetailsController.removeData(req, res));

export default routes;
