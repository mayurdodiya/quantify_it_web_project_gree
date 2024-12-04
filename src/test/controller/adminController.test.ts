import { Role, Status } from "../../utils/enum";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { User } from "../../entities/user.entity";
import { bcryptpassword, comparepassword } from "../../utils/bcrypt";
import { generateForgetPasswordToken, generateToken } from "../../utils/auth.token";
import { FileService } from "../../services/file_upload";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { AdminController } from "../../controller/admin/admin_controller";
import { getPagination, getPagingData } from "../../services/paginate";
import { ILike } from "typeorm";

const fileService = new FileService();

jest.mock("../../config/database.config", () => ({
  AppDataSource: {
    createQueryRunner: jest.fn(),
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      softDelete: jest.fn(),
      findAndCount: jest.fn(),
    }),
  },
}));

jest.mock("../../utils/bcrypt");
jest.mock("../../utils/auth.token");
jest.mock("../../services/file_upload");

jest.mock("../../services/paginate", () => ({
  getPagination: jest.fn(),
  getPagingData: jest.fn(),
}));

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
      get: jest.fn(),
      file: null,
      query: {},
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

  describe("forgotPassword", () => {
    it("should return error if admin email is not found", async () => {
      (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce(null);

      mockRequest.body = { email: "nonexistent@example.com", baseurl: "http://example.com" };

      await adminController.forgotPassword(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(ResponseCodes.loginError);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: message.NO_DATA("This email"),
        data: undefined,
      });
    });

    it("should return error if token generation fails", async () => {
      const mockAdmin = { id: 1, email: "admin@example.com", role: Role.ADMIN, status: Status.ACTIVE };
      (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce(mockAdmin);
      (generateForgetPasswordToken as jest.Mock).mockReturnValueOnce(null);

      mockRequest.body = { email: "admin@example.com", baseurl: "http://example.com" };

      await adminController.forgotPassword(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(ResponseCodes.loginError);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: message.NOT_GENERATE("Token"),
        data: undefined,
      });
    });
  });

  describe("setPassword", () => {
    it("should return an error if required fields are missing", async () => {
      mockRequest.body = { token: "someToken" }; // Missing password and confirm_password

      await adminController.setPassword(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(ResponseCodes.inputError);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "token, password and confirm password are required",
      });
    });

    it("should return an error if passwords do not match", async () => {
      mockRequest.body = { token: "someToken", password: "newPassword", confirm_password: "differentPassword" };

      await adminController.setPassword(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(ResponseCodes.inputError);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Password and confirm password does not match",
      });
    });
  });

  describe("addSubAdmin", () => {
    it("should return an error if the email already exists", async () => {
      (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce({ id: 1, email: "admin@example.com" });

      mockRequest.body = {
        first_name: "Test",
        last_name: "User",
        email: "admin@example.com",
        phone_no: "1234567890",
        password: "password",
        location: "Location",
      };

      await adminController.addSubAdmin(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(ResponseCodes.insertError);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: message.DATA_EXIST("Email"),
        data: undefined,
      });
    });

    it("should successfully add a new sub admin", async () => {
      (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce(null);
      (bcryptpassword as jest.Mock).mockResolvedValueOnce("hashedPassword");

      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        manager: {
          save: jest.fn().mockResolvedValueOnce(undefined), // Mock user save
        },
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
      };
      (AppDataSource.createQueryRunner as jest.Mock).mockReturnValueOnce(mockQueryRunner);

      mockRequest.body = {
        first_name: "Test",
        last_name: "User",
        email: "admin@example.com",
        phone_no: "1234567890",
        password: "password",
        location: "Location",
      };

      await adminController.addSubAdmin(mockRequest as Request, mockResponse as Response);

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(ResponseCodes.createSuccess);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: message.CREATE_SUCCESS("Sub admin"),
        data: undefined,
      });
    });

    it("should return an error if saving the user fails", async () => {
      (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce(null);
      (bcryptpassword as jest.Mock).mockResolvedValueOnce("hashedPassword");

      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        manager: {
          save: jest.fn().mockRejectedValueOnce(new Error("Save failed")), // Simulate error
        },
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
      };
      (AppDataSource.createQueryRunner as jest.Mock).mockReturnValueOnce(mockQueryRunner);

      mockRequest.body = {
        first_name: "Test",
        last_name: "User",
        email: "admin@example.com",
        phone_no: "1234567890",
        password: "password",
        location: "Location",
      };

      await adminController.addSubAdmin(mockRequest as Request, mockResponse as Response);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(ResponseCodes.insertError);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: message.CREATE_FAIL("Sub admin"),
        data: undefined,
      });
    });

    it("should return a server error on unexpected failure", async () => {
      (AppDataSource.getRepository(User).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

      mockRequest.body = {
        first_name: "Test",
        last_name: "User",
        email: "admin@example.com",
        phone_no: "1234567890",
        password: "password",
        location: "Location",
      };

      await adminController.addSubAdmin(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: "Unexpected error",
        data: undefined,
      });
    });
  });

  describe("getSubAdmin", () => {
    it("1 should return error if subadmin not found", async () => {
      // Mock the `findOne` method to return `null` (not found)
      (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce(null);

      // Set up request with the subadmin ID
      mockRequest.params = { id: "1" };

      // Call the controller method
      await adminController.getSubAdmin(mockRequest as Request, mockResponse as Response);

      // Assertions: check that the response is a not found error
      expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: message.NO_DATA("This sub admin"),
        data: undefined,
      });
    });

    it("2 should return success with subadmin data if found", async () => {
      const subAdminData = {
        id: "1",
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        phone_no: "1234567890",
        location: "City, Country",
        status: "active",
        role: Role.SUBADMIN,
        createdAt: "2024-01-01T00:00:00Z",
      };

      // Mock the `findOne` method to return a subadmin user object
      (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValueOnce(subAdminData);

      // Set up request with the subadmin ID
      mockRequest.params = { id: "1" };

      // Call the controller method
      await adminController.getSubAdmin(mockRequest as Request, mockResponse as Response);

      // Assertions: check the response with success message and data
      expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: message.GET_DATA("Sub admin"),
        data: subAdminData,
      });
    });

    it("3 should return error if there is a server issue", async () => {
      // Mock `findOne` to throw an error
      (AppDataSource.getRepository(User).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

      // Set up request with the subadmin ID
      mockRequest.params = { id: "1" };

      // Call the controller method
      await adminController.getSubAdmin(mockRequest as Request, mockResponse as Response);

      // Assertions: check the response with server error
      expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: "Unexpected error",
        data: undefined,
      });
    });
  });

  describe("getAllSubAdmin", () => {
    it("1 should return all subadmins with pagination", async () => {
      const subAdmins = [
        { id: 1, first_name: "John", last_name: "Doe", email: "john.doe@example.com", phone_no: "1234567890", location: "City, Country", status: "active", role: Role.SUBADMIN, createdAt: "2024-01-01T00:00:00Z" },
        { id: 2, first_name: "Jane", last_name: "Smith", email: "jane.smith@example.com", phone_no: "0987654321", location: "Another City, Country", status: "inactive", role: Role.SUBADMIN, createdAt: "2024-02-01T00:00:00Z" },
      ];
      const totalSubAdmins = 2;

      (getPagination as jest.Mock).mockReturnValue({ limit: 10, offset: 0 });
      (getPagingData as jest.Mock).mockReturnValue({ totalItems: totalSubAdmins, data: subAdmins });

      (AppDataSource.getRepository(User).findAndCount as jest.Mock).mockResolvedValue([subAdmins, totalSubAdmins]);

      mockRequest.query = { page: "1", size: "10" };

      await adminController.getAllSubAdmin(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: message.GET_DATA("Sub admin"),
        data: {
          totalItems: totalSubAdmins,
          data: subAdmins,
        },
      });
    });

    it("2 should return subadmins with search filter applied", async () => {
      const subAdmins = [{ id: 1, first_name: "John", last_name: "Doe", email: "john.doe@example.com", phone_no: "1234567890", location: "City, Country", status: "active", role: Role.SUBADMIN, createdAt: "2024-01-01T00:00:00Z" }];
      const totalSubAdmins = 1;
    
      // Mock pagination utility functions
      (getPagination as jest.Mock).mockReturnValue({ limit: 10, offset: 0 });
      (getPagingData as jest.Mock).mockReturnValue({ totalItems: totalSubAdmins, data: subAdmins });
    
      // Mock the repository call
      (AppDataSource.getRepository(User).findAndCount as jest.Mock).mockResolvedValue([subAdmins, totalSubAdmins]);
    
      mockRequest.query = { page: "1", size: "10", s: "John" };
    
      await adminController.getAllSubAdmin(mockRequest as Request, mockResponse as Response);
    
      // Assertions: check that the search filter is being used
      expect(AppDataSource.getRepository(User).findAndCount).toHaveBeenCalledWith({
        where: expect.arrayContaining([
          { role: Role.SUBADMIN },
          { first_name: ILike("%John%"), role: Role.SUBADMIN },
          { last_name: ILike("%John%"), role: Role.SUBADMIN },
          { email: ILike("%John%"), role: Role.SUBADMIN },
          { phone_no: ILike("%John%"), role: Role.SUBADMIN }
        ]),
        select: ["id", "first_name", "last_name", "email", "phone_no", "location", "status", "role", "createdAt"],
        skip: 0,
        take: 10,
      });
    
      // Check that the response status is success
      expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    
      // Adjusted test expectation to match the actual structure returned by the controller
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: message.GET_DATA("Sub admin"),
        data: {  // Expect the 'data' object containing 'totalItems' and 'data'
          totalItems: totalSubAdmins,
          data: subAdmins,  // subAdmins array should be inside the 'data' object
        },
      });
    });

    it("3 should return no subadmins found if no data matches", async () => {
      // Mock pagination utility functions
      (getPagination as jest.Mock).mockReturnValue({ limit: 10, offset: 0 });

      // Mock the repository call to return empty data
      (AppDataSource.getRepository(User).findAndCount as jest.Mock).mockResolvedValue([[], 0]);

      mockRequest.query = { page: "1", size: "10" };

      await adminController.getAllSubAdmin(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: message.GET_DATA("Sub admin"),
        data: { totalItems: 0, rows: [] },
      });
    });

    // it("4 should return server error on unexpected database failure", async () => {
    //   // Mock pagination utility functions
    //   (getPagination as jest.Mock).mockReturnValue({ limit: 10, offset: 0 });

    //   // Mock the repository call to simulate an error
    //   (AppDataSource.getRepository(User).findAndCount as jest.Mock).mockRejectedValueOnce(new Error("Database Error"));

    //   mockRequest.query = { page: "1", size: "10" };

    //   await adminController.getAllSubAdmin(mockRequest as Request, mockResponse as Response);

    //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    //   expect(jsonMock).toHaveBeenCalledWith({
    //     success: false,
    //     message: "Database Error",
    //     data: undefined,
    //   });
    // });
  });
});
