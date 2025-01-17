import { FindOperator, ILike, Not, Repository } from "typeorm";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { RoutesHandler } from "../../utils/error_handler";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { EmployeeDetails } from "../../entities/employee_details.entity";
import { getPagination, getPagingData } from "../../services/paginate";

export class EmployeeDetailsController {
  private employeeDetailsRepo: Repository<EmployeeDetails>;

  constructor() {
    this.employeeDetailsRepo = AppDataSource.getRepository(EmployeeDetails);
  }

  // add data
  public addEmployeeDetails = async (req: Request, res: Response) => {
    try {
      const { name, img_url, rating, description } = req.body;
      const getData = await this.employeeDetailsRepo.findOne({
        where: { name: name },
      });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This employee data"), ResponseCodes.alreadyExist);
      }

      const employeeData = new EmployeeDetails();

      employeeData.name = name;
      employeeData.img_url = img_url;
      employeeData.rating = rating;
      employeeData.description = description;

      const data = await this.employeeDetailsRepo.save(employeeData);

      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.CREATE_FAIL("employee data"), ResponseCodes.insertError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Employee data"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateEmployeeDetails(req: Request, res: Response) {
    try {
      const { name, img_url, rating, description } = req.body;

      const dataId = req.params.id;
      const getData = await this.employeeDetailsRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This employee data"), ResponseCodes.notFound);
      }
      const isExist = await this.employeeDetailsRepo.findOne({
        where: { name: name, id: Not(dataId) },
      });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This employee data"), ResponseCodes.alreadyExist);
      }
      getData.name = name || getData.name;
      getData.img_url = img_url || getData.img_url;
      getData.rating = rating || getData.rating;
      getData.description = description || getData.rating;

      const data = await this.employeeDetailsRepo.save(getData);

      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("employee data"), ResponseCodes.saveError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Employee data"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getEmployeeDetails(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const data = await this.employeeDetailsRepo.findOne({
        where: { id: dataId },
        select: ["id", "name", "img_url", "rating", "description", "createdAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This employee data"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Employee data"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all employee details
  public async getAllEmployeeDetails(req: Request, res: Response) {
    try {
      const { page = 1, size = 10, s } = req.query;

      const { limit, offset } = getPagination(parseInt(page as string, 10), parseInt(size as string, 10));

      const Dataobj: {
        name?: FindOperator<string>;
        rating?: FindOperator<string>;
      } = {};
      if (s) {
        Dataobj.name = ILike(`%${s}%`);
        Dataobj.rating = ILike(`%${s}%`);
      }

      const [data, totalItems] = await this.employeeDetailsRepo.findAndCount({
        where: Dataobj,
        select: ["id", "name", "img_url", "rating", "description", "createdAt", "updatedAt"],
        skip: offset,
        take: limit,
      });

      const response = getPagingData({ count: totalItems, rows: data }, parseInt(page as string, 10), limit);

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Employee data"), ResponseCodes.success, response);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message || "Internal server error", ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeEmployeeDetails(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const getData = await this.employeeDetailsRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This employee data"), ResponseCodes.notFound);
      }
      const data = await this.employeeDetailsRepo.softDelete({ id: dataId });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This employee data"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Employee data"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
