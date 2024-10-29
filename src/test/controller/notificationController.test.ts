import { Request, Response } from "express";
import { NotificationController } from "../../controller/notification/notification_controller";
import { Notification } from "../../entities/notification.entity";
import { AppDataSource } from "../../config/database.config";
import { ResponseCodes } from "../../utils/response-codes";
import { message } from "../../utils/messages";

jest.mock("../../config/database.config", () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    }),
  },
}));

describe("NotificationController", () => {
  let notificationController: NotificationController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    notificationController = new NotificationController();
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    mockRequest = {
      params: {},
      body: {},
      query: {},
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;
  });

  // Add Notification
  it("1 should save new notification", async () => {
    const notificationData = { id: 1 };
    (AppDataSource.getRepository(Notification).save as jest.Mock).mockResolvedValueOnce(notificationData);

    await notificationController.addNotification("1", "2", "Test message", "image.jpg", "192.168.0.1");

    expect(AppDataSource.getRepository(Notification).save).toHaveBeenCalledWith(expect.any(Notification));
  });

  // Change Notification Status
  it("2 should return not found if notification does not exist", async () => {
    (AppDataSource.getRepository(Notification).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };
    mockRequest.body = { is_read: true };

    await notificationController.notificationStatus(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This notification"),
      data: undefined,
    });
  });

  it("3 should update notification status and return success", async () => {
    const existingNotification = { id: 1, is_read: false };
    (AppDataSource.getRepository(Notification).findOne as jest.Mock).mockResolvedValueOnce(existingNotification);
    (AppDataSource.getRepository(Notification).save as jest.Mock).mockResolvedValueOnce({ ...existingNotification, is_read: true });

    mockRequest.params = { id: "1" };
    mockRequest.body = { is_read: true };

    await notificationController.notificationStatus(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.UPDATED_SUCCESSFULLY("Notification status"),
      data: undefined,
    });
  });

  // Get Notification
  it("4 should return notification data if found", async () => {
    const notificationData = { id: 1, sender_id: "1", receiver_id: "2", message: "Test", is_read: false };
    (AppDataSource.getRepository(Notification).findOne as jest.Mock).mockResolvedValueOnce(notificationData);

    mockRequest.params = { id: "1" };

    await notificationController.getNotification(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Notification"),
      data: notificationData,
    });
  });

  it("5 should return not found if notification does not exist for get by id", async () => {
    (AppDataSource.getRepository(Notification).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await notificationController.getNotification(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This notification"),
      data: undefined,
    });
  });

  // Get All Notifications
  it("6 should return a list of notifications", async () => {
    const notifications = [
      { id: 1, sender_id: "1", receiver_id: "2", message: "Test 1", is_read: false },
      { id: 2, sender_id: "3", receiver_id: "4", message: "Test 2", is_read: true },
    ];
    (AppDataSource.getRepository(Notification).find as jest.Mock).mockResolvedValueOnce(notifications);

    await notificationController.getAllNotification(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Notification"),
      data: notifications,
    });
  });

  it("7 should return not found if no notifications exist", async () => {
    (AppDataSource.getRepository(Notification).find as jest.Mock).mockResolvedValueOnce([]);

    await notificationController.getAllNotification(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This notification"),
      data: undefined,
    });
  });
});
