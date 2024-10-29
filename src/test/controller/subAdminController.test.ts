import { Request, Response } from "express";
import { User } from "../../entities/user.entity";
import { AppDataSource } from "../../config/database.config";
import { SubAdminController } from "../../controller/sub_admin/sub_admin_controller";
import { RoutesHandler } from "../../utils/error_handler";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { comparepassword } from "../../utils/bcrypt";
import { generateToken } from "../../utils/auth.token";
import { Role, Status } from "../../utils/enum";

jest.mock("../../config/database.config", () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
    }),
  },
}));

jest.mock("../../utils/bcrypt", () => ({
  comparepassword: jest.fn(),
}));

jest.mock("../../utils/auth.token", () => ({
  generateToken: jest.fn(),
}));

jest.mock("../../utils/error_handler", () => ({
  RoutesHandler: {
    sendError: jest.fn(),
    sendSuccess: jest.fn(),
  },
}));

describe("SubAdminController", () => {
  let subAdminController: SubAdminController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    subAdminController = new SubAdminController();
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    mockRequest = {
      params: {},
      body: {},
    };

    mockResponse = {
      status: statusMock,
    } as unknown as Response;
  });

  // Login sub admin
  it("1 should log in sub admin and return success", async () => {
    const mockUser = { id: 1, password: "hashedPassword", role: Role.SUBADMIN, status: Status.ACTIVE };
    (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce(mockUser);
    (comparepassword as jest.Mock).mockResolvedValueOnce(true);
    (generateToken as jest.Mock).mockReturnValueOnce("mockToken");

    mockRequest.body = {
      email: "test@example.com",
      password: "password",
    };

    await subAdminController.loginSubAdmin(mockRequest as Request, mockResponse as Response);

    expect(RoutesHandler.sendSuccess).toHaveBeenCalledWith(mockRequest, mockResponse, true, message.LOGIN_SUCCESS, ResponseCodes.success, expect.objectContaining({ token: "mockToken" }));
  });

  it("2 should return error if email not found", async () => {
    (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.body = { email: "test@example.com", password: "password" };

    await subAdminController.loginSubAdmin(mockRequest as Request, mockResponse as Response);

    expect(RoutesHandler.sendError).toHaveBeenCalledWith(mockRequest, mockResponse, false, message.NO_DATA("This email"), ResponseCodes.loginError);
  });

  it("3 should return error if password does not match", async () => {
    const mockUser = { id: 1, password: "hashedPassword", role: Role.SUBADMIN, status: Status.ACTIVE };
    (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce(mockUser);
    (comparepassword as jest.Mock).mockResolvedValueOnce(false);

    mockRequest.body = { email: "test@example.com", password: "wrongPassword" };

    await subAdminController.loginSubAdmin(mockRequest as Request, mockResponse as Response);

    expect(RoutesHandler.sendError).toHaveBeenCalledWith(mockRequest, mockResponse, false, message.NOT_MATCH("Password"), ResponseCodes.loginError);
  });

  it("4 should return error if token generation fails", async () => {
    const mockUser = { id: 1, password: "hashedPassword", role: Role.SUBADMIN, status: Status.ACTIVE };
    (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce(mockUser);
    (comparepassword as jest.Mock).mockResolvedValueOnce(true);
    (generateToken as jest.Mock).mockReturnValueOnce(null);

    mockRequest.body = { email: "test@example.com", password: "password" };

    await subAdminController.loginSubAdmin(mockRequest as Request, mockResponse as Response);

    expect(RoutesHandler.sendError).toHaveBeenCalledWith(mockRequest, mockResponse, false, message.NOT_GENERATE("Token"), ResponseCodes.loginError);
  });

  // Get sub admin by ID
  it("5 should return sub admin data if found", async () => {
    const mockSubAdmin = { id: 1, first_name: "John", last_name: "Doe", email: "john@example.com" };
    (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce(mockSubAdmin);

    mockRequest.params = { id: "1" };

    await subAdminController.getSubAdmin(mockRequest as Request, mockResponse as Response);

    expect(RoutesHandler.sendSuccess).toHaveBeenCalledWith(mockRequest, mockResponse, true, message.GET_DATA("Sub admin"), ResponseCodes.success, mockSubAdmin);
  });

  it("6 should return not found if sub admin does not exist", async () => {
    (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await subAdminController.getSubAdmin(mockRequest as Request, mockResponse as Response);

    expect(RoutesHandler.sendError).toHaveBeenCalledWith(mockRequest, mockResponse, false, message.NO_DATA("Sub admin"), ResponseCodes.notFound);
  });

  // Update sub admin
  it("7 should update sub admin data and return success", async () => {
    const existingSubAdmin = { id: 1, email: "old@example.com", first_name: "Old", last_name: "Name" };
    (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce(existingSubAdmin);
    (AppDataSource.getRepository(User).save as jest.Mock).mockResolvedValueOnce(existingSubAdmin);

    mockRequest.params = { id: "1" };
    mockRequest.body = { email: "new@example.com", first_name: "New" };

    await subAdminController.updateSubAdmin(mockRequest as Request, mockResponse as Response);

    expect(RoutesHandler.sendSuccess).toHaveBeenCalledWith(mockRequest, mockResponse, true, message.UPDATED_SUCCESSFULLY("Your profile"), ResponseCodes.success, undefined);
  });

  it("8 should return error if sub admin does not exist for update", async () => {
    (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };
    mockRequest.body = { email: "new@example.com" };

    await subAdminController.updateSubAdmin(mockRequest as Request, mockResponse as Response);

    expect(RoutesHandler.sendError).toHaveBeenCalledWith(mockRequest, mockResponse, false, message.NO_DATA("This user"), ResponseCodes.notFound);
  });

  it("9 should return error if email already exists", async () => {
    const existingSubAdmin = { id: 1, email: "old@example.com" };
    (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce(existingSubAdmin);
    (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce(existingSubAdmin);

    mockRequest.params = { id: "1" };
    mockRequest.body = { email: "old@example.com" };

    await subAdminController.updateSubAdmin(mockRequest as Request, mockResponse as Response);

    expect(RoutesHandler.sendError).toHaveBeenCalledWith(mockRequest, mockResponse, false, message.DATA_EXIST("This email"), ResponseCodes.alreadyExist);
  });

  // Remove sub admin
  it("10 should remove sub admin and return success", async () => {
    (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });
    (AppDataSource.getRepository(User).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 1 });

    mockRequest.params = { id: "1" };

    await subAdminController.removeSubAdmin(mockRequest as Request, mockResponse as Response);

    expect(RoutesHandler.sendSuccess).toHaveBeenCalledWith(mockRequest, mockResponse, true, message.DELETE_SUCCESS("Sub admin"), ResponseCodes.success, undefined);
  });

  it("11 should return not found if sub admin does not exist for deletion", async () => {
    (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await subAdminController.removeSubAdmin(mockRequest as Request, mockResponse as Response);

    expect(RoutesHandler.sendError).toHaveBeenCalledWith(mockRequest, mockResponse, false, message.NO_DATA("This sub admin"), ResponseCodes.notFound);
  });


  it("13 should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(User).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await subAdminController.removeSubAdmin(mockRequest as Request, mockResponse as Response);

    expect(RoutesHandler.sendError).toHaveBeenCalledWith(mockRequest, mockResponse, false, "Unexpected error", ResponseCodes.serverError);
  });
});
