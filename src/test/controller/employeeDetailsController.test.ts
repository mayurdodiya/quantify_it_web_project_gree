import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { EmployeeDetails } from "../../entities/employee_details.entity";
import { EmployeeDetailsController } from "../../controller/employee_details/employee_details_controller";

jest.mock("../../config/database.config", () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      softDelete: jest.fn(),
    }),
  },
}));

describe("employeeDetailsController", () => {
  let employeeDetailsController: EmployeeDetailsController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    employeeDetailsController = new EmployeeDetailsController();
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    mockRequest = {
      params: {},
      body: {},
      get: jest.fn(),
    };

    mockResponse = {
      status: statusMock,
      set: jest.fn(),
      header: jest.fn(),
      json: jsonMock,
    } as unknown as Response;
  });

  //create
  it("should return an error if employee data already exists", async () => {
    (AppDataSource.getRepository(EmployeeDetails).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {};

    await employeeDetailsController.addEmployeeDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.alreadyExist);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.DATA_EXIST("This employee data"),
      data: undefined,
    });
  });

  it("should save new employee data and return success", async () => {
    (AppDataSource.getRepository(EmployeeDetails).findOne as jest.Mock).mockResolvedValueOnce(null);

    (AppDataSource.getRepository(EmployeeDetails).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {};

    await employeeDetailsController.addEmployeeDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.CREATE_SUCCESS("Employee data"),
      data: undefined,
    });
  });

  it("should return server error on failure", async () => {
    (AppDataSource.getRepository(EmployeeDetails).findOne as jest.Mock).mockRejectedValueOnce(new Error("Server error"));

    await employeeDetailsController.addEmployeeDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
      data: undefined,
    });
  });

  //edit
  it("should return not found if employee data does not exist", async () => {
    (AppDataSource.getRepository(EmployeeDetails).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await employeeDetailsController.updateEmployeeDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This employee data"),
      data: undefined,
    });
  });

  it("should update the employee data and return save error", async () => {
    const existingService = {
      id: 1,
    };

    (AppDataSource.getRepository(EmployeeDetails).findOne as jest.Mock).mockResolvedValueOnce(existingService);

    mockRequest.params = { id: "1" };
    mockRequest.body = {};

    await employeeDetailsController.updateEmployeeDetails(mockRequest as Request, mockResponse as Response);
    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.saveError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.UPDATE_FAILED("employee data"),
      data: undefined,
    });
  });

  //find
  it("5 should return not found if employee data does not exist", async () => {
    (AppDataSource.getRepository(EmployeeDetails).find as jest.Mock).mockResolvedValueOnce(null);

    await employeeDetailsController.getAllEmployeeDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Employee data"),
      data: null,
    });
  });

  it("6 should return employee data data if found", async () => {
    const empData = {
      id: 1,
    };

    (AppDataSource.getRepository(EmployeeDetails).find as jest.Mock).mockResolvedValueOnce(empData);

    await employeeDetailsController.getAllEmployeeDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Employee data"),
      data: empData,
    });
  });

  it("7 should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(EmployeeDetails).find as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    await employeeDetailsController.getAllEmployeeDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });

  //findOne
  it("should return employee data data if found", async () => {
    const empData = {
      id: 1,
    };

    (AppDataSource.getRepository(EmployeeDetails).findOne as jest.Mock).mockResolvedValueOnce(empData);

    mockRequest.params = { id: "1" };

    await employeeDetailsController.getEmployeeDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Employee data"),
      data: empData,
    });
  });

  it("should return not found if employee data does not exist", async () => {
    (AppDataSource.getRepository(EmployeeDetails).findOne as jest.Mock).mockResolvedValueOnce(null);
    mockRequest.params = { id: "1" };

    await employeeDetailsController.getEmployeeDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This employee data"),
      data: undefined,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(EmployeeDetails).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));
    mockRequest.params = { id: "1" };

    await employeeDetailsController.getEmployeeDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });

  //delete
  it("should return success if employee data is soft deleted", async () => {
    (AppDataSource.getRepository(EmployeeDetails).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 1 });

    mockRequest.params = { id: "1" };

    await employeeDetailsController.removeEmployeeDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This employee data"),
      data: undefined,
    });
  });

  it("should return not found if employee data does not exist", async () => {
    (AppDataSource.getRepository(EmployeeDetails).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 0 });

    mockRequest.params = { id: "1" };

    await employeeDetailsController.removeEmployeeDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This employee data"),
      data: undefined,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(EmployeeDetails).softDelete as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await employeeDetailsController.removeEmployeeDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This employee data"),
      data: undefined,
    });
  });
});
