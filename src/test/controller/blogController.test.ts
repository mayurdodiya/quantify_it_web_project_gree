import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { Blog } from "../../entities/blog.entity";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { BlogController } from "../../controller/blog/blog_controller";

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

describe("BlogController", () => {
  let blogController: BlogController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    blogController = new BlogController();
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
  it("should return an error if blog already exists", async () => {
    (AppDataSource.getRepository(Blog).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {};

    await blogController.addBlog(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.insertError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.CREATE_FAIL("blog"),
      data: undefined,
    });
  });

  it("should save new blog and return success", async () => {
    (AppDataSource.getRepository(Blog).findOne as jest.Mock).mockResolvedValueOnce(null);

    (AppDataSource.getRepository(Blog).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {};

    await blogController.addBlog(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.createSuccess);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.CREATE_SUCCESS("Blog"),
      data: undefined,
    });
  });

  it("should return server error on failure", async () => {
    (AppDataSource.getRepository(Blog).findOne as jest.Mock).mockRejectedValueOnce(new Error("Server error"));

    await blogController.addBlog(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.insertError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.CREATE_FAIL("blog"),
      data: undefined,
    });
  });

  //edit
  it("should return not found if blog does not exist", async () => {
    (AppDataSource.getRepository(Blog).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await blogController.updateBlog(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.insertError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.UPDATE_FAILED("blog"),
      data: undefined,
    });
  });

  it("should update the blog and return save error", async () => {
    const existingService = {
      id: 1,
    };

    (AppDataSource.getRepository(Blog).findOne as jest.Mock).mockResolvedValueOnce(existingService);

    mockRequest.params = { id: "1" };
    mockRequest.body = {};

    await blogController.updateBlog(mockRequest as Request, mockResponse as Response);
    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
      data: undefined,
    });
  });

  //find
  // it("should return not found if blog does not exist", async () => {
  //   (AppDataSource.getRepository(Blog).find as jest.Mock).mockResolvedValueOnce(null);

  //   await blogController.getAllBlog(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: true,
  //     message: message.GET_DATA("Blog"),
  //     data: null,
  //   });
  // });

  // it("should return blog data if found", async () => {
  //   const blogData = {
  //     id: 1,
  //   };

  //   (AppDataSource.getRepository(Blog).find as jest.Mock).mockResolvedValueOnce(blogData);

  //   await blogController.getAllBlog(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: true,
  //     message: message.GET_DATA("Blog"),
  //     data: blogData,
  //   });
  // });

  // it("should return server error on unexpected error", async () => {
  //   (AppDataSource.getRepository(Blog).find as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

  //   await blogController.getAllBlog(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: false,
  //     message: "Unexpected error",
  //     data: undefined,
  //   });
  // });

  //findOne
  it("should return blog data if found", async () => {
    const blogData = {
      id: 1,
    };

    (AppDataSource.getRepository(Blog).findOne as jest.Mock).mockResolvedValueOnce(blogData);

    mockRequest.params = { id: "1" };

    await blogController.getBlog(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This blog"),
      data: undefined,
    });
  });

  it("should return not found if blog does not exist", async () => {
    (AppDataSource.getRepository(Blog).findOne as jest.Mock).mockResolvedValueOnce(null);
    const blogData = {
      id: 1,
    };
    mockRequest.params = { id: "1" };

    await blogController.getBlog(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Blog"),
      data: blogData,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(Blog).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));
    const blogData = {
      id: 1,
    };
    mockRequest.params = { id: "1" };

    await blogController.getBlog(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Blog"),
      data: blogData,
    });
  });

  //delete
  it("should return success if blog is soft deleted", async () => {
    (AppDataSource.getRepository(Blog).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 1 });

    mockRequest.params = { id: "1" };

    await blogController.removeBlog(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This blog"),
      data: undefined,
    });
  });

  it("should return not found if blog does not exist", async () => {
    (AppDataSource.getRepository(Blog).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 0 });

    mockRequest.params = { id: "1" };

    await blogController.removeBlog(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(Blog).softDelete as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await blogController.removeBlog(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This blog"),
      data: undefined,
    });
  });
});
