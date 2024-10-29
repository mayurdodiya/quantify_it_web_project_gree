import { Request, Response } from "express";
import { NotificationController } from "../../controller/notification/notification_controller";
import { AppDataSource } from "../../config/database.config";
import { Notification } from "../../entities/notification.entity";

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let mockRequest: Partial<Request>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  // Assuming you have imported NotificationController appropriately
  beforeEach(() => {
    notificationController = new NotificationController();
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    // Mocking the request and response
    mockRequest = {
      params: {},
      body: {},
      query: {},
      get: jest.fn((header: string) => {
        switch (header) {
          case "origin":
            return "http://localhost"; // Return a test value for the "origin" header
          case "set-cookie":
            return []; // Return an empty array for "set-cookie"
          default:
            return undefined; // For other headers, return undefined
        }
      }),
    } as Partial<Request>;

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    } as Partial<Response>;
  });

  // Add notification
  it("1 should save a new notification and not throw an error", async () => {
    (AppDataSource.getRepository(Notification).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

    const sender_id = "123";
    const receiver_id = "456";
    const messageText = "New Notification";
    const image_url = "image.jpg";
    const user_ip_address = "192.168.0.1";

    await notificationController.addNotification(sender_id, receiver_id, messageText, image_url, user_ip_address);

    expect(AppDataSource.getRepository(Notification).save).toHaveBeenCalledWith(
      expect.objectContaining({
        sender_id,
        receiver_id,
        message: messageText,
        image_url,
        user_ip_address,
      })
    );
  });

  // Change notification status
  //   it("2 should return not found if notification does not exist", async () => {
  //     (AppDataSource.getRepository(Notification).findOne as jest.Mock).mockResolvedValueOnce(null);

  //     mockRequest.params = { id: "1" };
  //     mockRequest.body = { is_read: true };

  //     await notificationController.notificationStatus(mockRequest as Request, mockResponse as Response);

  //     expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
  //     expect(jsonMock).toHaveBeenCalledWith({
  //       success: false,
  //       message: message.NO_DATA("This notification"),
  //       data: undefined,
  //     });
  //   });

  //   it("3 should update the notification status and return success", async () => {
  //     const existingNotification = { id: 1, is_read: false };
  //     (AppDataSource.getRepository(Notification).findOne as jest.Mock).mockResolvedValueOnce(existingNotification);
  //     (AppDataSource.getRepository(Notification).save as jest.Mock).mockResolvedValueOnce({ ...existingNotification, is_read: true });

  //     mockRequest.params = { id: "1" };
  //     mockRequest.body = { is_read: true };

  //     await notificationController.notificationStatus(mockRequest as Request, mockResponse as Response);

  //     expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
  //     expect(jsonMock).toHaveBeenCalledWith({
  //       success: true,
  //       message: message.UPDATED_SUCCESSFULLY("Notification status"),
  //       data: undefined,
  //     });
  //   });

  //   // Get notification
  //   it("4 should return not found if notification does not exist", async () => {
  //     (AppDataSource.getRepository(Notification).findOne as jest.Mock).mockResolvedValueOnce(null);

  //     mockRequest.params = { id: "1" };

  //     await notificationController.getNotification(mockRequest as Request, mockResponse as Response);

  //     expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
  //     expect(jsonMock).toHaveBeenCalledWith({
  //       success: false,
  //       message: message.NO_DATA("This notification"),
  //       data: undefined,
  //     });
  //   });

  //   it("5 should return notification data if found", async () => {
  //     const notificationData = { id: 1, sender_id: "123", receiver_id: "456", message: "Notification Message", image_url: "image.jpg", is_read: false, user_ip_address: "192.168.0.1" };
  //     (AppDataSource.getRepository(Notification).findOne as jest.Mock).mockResolvedValueOnce(notificationData);

  //     mockRequest.params = { id: "1" };

  //     await notificationController.getNotification(mockRequest as Request, mockResponse as Response);

  //     expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
  //     expect(jsonMock).toHaveBeenCalledWith({
  //       success: true,
  //       message: message.GET_DATA("Notification"),
  //       data: notificationData,
  //     });
  //   });

  //   // Get all notifications
  //   it("6 should return all notifications", async () => {
  //     const notifications = [
  //       { id: 1, sender_id: "123", receiver_id: "456", message: "Notification 1", image_url: "image1.jpg", is_read: false, user_ip_address: "192.168.0.1" },
  //       { id: 2, sender_id: "124", receiver_id: "457", message: "Notification 2", image_url: "image2.jpg", is_read: true, user_ip_address: "192.168.0.2" },
  //     ];
  //     (AppDataSource.getRepository(Notification).find as jest.Mock).mockResolvedValueOnce(notifications);

  //     await notificationController.getAllNotification(mockRequest as Request, mockResponse as Response);

  //     expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
  //     expect(jsonMock).toHaveBeenCalledWith({
  //       success: true,
  //       message: message.GET_DATA("Notification"),
  //       data: notifications,
  //     });
  //   });

  //   it("7 should return error if there are no notifications found", async () => {
  //     (AppDataSource.getRepository(Notification).find as jest.Mock).mockResolvedValueOnce([]);

  //     await notificationController.getAllNotification(mockRequest as Request, mockResponse as Response);

  //     expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
  //     expect(jsonMock).toHaveBeenCalledWith({
  //       success: false,
  //       message: message.NO_DATA("This notification"),
  //       data: undefined,
  //     });
  //   });
});
