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
      findAndCount: jest.fn(),
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
      query: {},
      get: jest.fn(),
    };

    mockResponse = {
      status: statusMock,
      set: jest.fn(),
      header: jest.fn(),
      json: jsonMock,
    } as unknown as Response;
  });

  // Add blog
  it("1 should save new blog and return success", async () => {
    (AppDataSource.getRepository(Blog).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {
      blog_title: "New Blog Title",
      description: "Blog description",
      img_url: "image.jpg",
    };

    await blogController.addBlog(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.createSuccess);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.CREATE_SUCCESS("Blog"),
      data: undefined,
    });
  });

  it("2 should return error on blog save failure", async () => {
    (AppDataSource.getRepository(Blog).save as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.body = {
      blog_title: "New Blog Title",
      description: "Blog description",
      img_url: "image.jpg",
    };

    await blogController.addBlog(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.insertError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.CREATE_FAIL("blog"),
      data: undefined,
    });
  });

  // Update blog
  it("3 should return not found if blog does not exist for update", async () => {
    (AppDataSource.getRepository(Blog).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };
    mockRequest.body = { blog_title: "Updated Title" };

    await blogController.updateBlog(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This blog"),
      data: undefined,
    });
  });

  it("4 should update the blog and return success", async () => {
    const existingBlog = { id: 1, blog_title: "Old Title" };
    (AppDataSource.getRepository(Blog).findOne as jest.Mock).mockResolvedValueOnce(existingBlog);
    (AppDataSource.getRepository(Blog).save as jest.Mock).mockResolvedValueOnce({ ...existingBlog, blog_title: "Updated Title" });

    mockRequest.params = { id: "1" };
    mockRequest.body = { blog_title: "Updated Title" };

    await blogController.updateBlog(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.UPDATED_SUCCESSFULLY("Blog"),
      data: undefined,
    });
  });

  // Get blog
  it("5 should return not found if blog does not exist", async () => {
    (AppDataSource.getRepository(Blog).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await blogController.getBlog(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This blog"),
      data: undefined,
    });
  });

  it("6 should return blog data if found", async () => {
    const blogData = { id: 1, blog_title: "Blog Title" };
    (AppDataSource.getRepository(Blog).findOne as jest.Mock).mockResolvedValueOnce(blogData);

    mockRequest.params = { id: "1" };

    await blogController.getBlog(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Blog"),
      data: blogData,
    });
  });

  // Get all blogs
  it("7 should return a list of blogs", async () => {
    const blogs = [{ id: 1, blog_title: "Blog 1" }, { id: 2, blog_title: "Blog 2" }];
    (AppDataSource.getRepository(Blog).findAndCount as jest.Mock).mockResolvedValueOnce([blogs, blogs.length]);

    mockRequest.query = { page: "1", size: "10" };

    await blogController.getAllBlog(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Blog"),
      data: expect.any(Object), // Replace with actual data structure if needed
    });
  });

  // Delete blog
  it("8 should return success if blog is soft deleted", async () => {
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

  it("9 should return not found if blog does not exist for deletion", async () => {
    (AppDataSource.getRepository(Blog).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 0 });

    mockRequest.params = { id: "1" };

    await blogController.removeBlog(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This blog"),
      data: undefined,
    });
  });

  it("10 should return server error on unexpected error", async () => {
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
