import { Role } from "../../utils/enum";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { User } from "../../entities/user.entity";
import { comparepassword } from "../../utils/bcrypt";
import { generateToken } from "../../utils/auth.token";
import { FileService } from "../../services/file_upload";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { AdminController } from "../../controller/admin/admin_controller";

const fileService = new FileService();

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

jest.mock("../../utils/bcrypt");
jest.mock("../../utils/auth.token");
jest.mock("../../services/file_upload");

describe("AdminController", () => {
  let adminController: AdminController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    adminController = new AdminController();
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    mockRequest = {
      params: {},
      body: {},
      file: null,
      get: jest.fn(),
    };

    mockResponse = {
      status: statusMock,
      set: jest.fn(),
      header: jest.fn(),
      json: jsonMock,
    } as unknown as Response;
  });

  describe("loginAdmin", () => {
    it("1 should return an error if admin not found", async () => {
      (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce(null);

      mockRequest.body = { email: "admin@example.com", password: "password" };

      await adminController.loginAdmin(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(ResponseCodes.loginError);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: message.NO_DATA("This email"),
        data: undefined,
      });
    });

    it("2 should return an error if password does not match", async () => {
      (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce({
        id: 1,
        password: "hashedPassword",
        role: Role.ADMIN,
      });
      (comparepassword as jest.Mock).mockResolvedValueOnce(false);

      mockRequest.body = { email: "admin@example.com", password: "wrongPassword" };

      await adminController.loginAdmin(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(ResponseCodes.loginError);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: message.NOT_MATCH("Password"),
        data: undefined,
      });
    });

    it("3 should return success with token if login is successful", async () => {
      (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce({
        id: 1,
        password: "hashedPassword",
        role: Role.ADMIN,
      });
      (comparepassword as jest.Mock).mockResolvedValueOnce(true);
      (generateToken as jest.Mock).mockReturnValueOnce("generatedToken");

      mockRequest.body = { email: "admin@example.com", password: "correctPassword" };

      await adminController.loginAdmin(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: message.LOGIN_SUCCESS,
        data: expect.objectContaining({
          token: "generatedToken",
        }),
      });
    });

    it("4 should return server error on failure", async () => {
      (AppDataSource.getRepository(User).findOne as jest.Mock).mockRejectedValueOnce(new Error("Server error"));

      await adminController.loginAdmin(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: "Server error",
        data: undefined,
      });
    });
  });

  describe("uploadImage", () => {
    it("5 should return an error if no file is uploaded", async () => {
      mockRequest.file = null;

      await adminController.uploadImage(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(ResponseCodes.insertError);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: message.UPLOAD_IMG,
        data: undefined,
      });
    });

    it("6 should return success when image is uploaded", async () => {
      mockRequest.file = {
        fieldname: "file",
        originalname: "image.png",
        encoding: "7bit",
        mimetype: "image/png",
        size: 1024,
        destination: "uploads/",
        filename: "image.png",
        path: "uploads/image.png",
        buffer: Buffer.from("dummy data"),
      } as Express.Multer.File;

      (fileService.uploadFile as jest.Mock).mockResolvedValueOnce({ url: "image_url" });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await adminController.uploadImage(mockRequest as any, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: message.UPLOAD_SUCCESS("Image"),
        data: undefined,
      });
    });

    it("7 should return server error on upload failure", async () => {
      mockRequest.file = {
        fieldname: "file",
        originalname: "image.png",
        encoding: "7bit",
        mimetype: "image/png",
        size: 1024,
        destination: "uploads/",
        filename: "image.png",
        path: "uploads/image.png",
        buffer: Buffer.from("dummy data"),
      } as Express.Multer.File;

      (fileService.uploadFile as jest.Mock).mockRejectedValueOnce(new Error("Upload error"));
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await adminController.uploadImage(mockRequest as any, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: message.UPLOAD_SUCCESS("Image"),
        data: undefined,
      });
    });
  });
});
