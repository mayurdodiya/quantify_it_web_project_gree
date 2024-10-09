import { RoutesHandler } from '../../utils/error_handler';
import { Request, Response } from 'express';

describe('RoutesHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    mockRequest = {
      get: jest.fn().mockReturnValue('http://example.com'),  // Mocking req.get method
    };

    mockResponse = {
      status: statusMock,
      set: jest.fn(),
      header: jest.fn(),
      json: jsonMock
    } as unknown as Response;
  });

  it('should send a success response', () => {
    RoutesHandler.sendSuccess(
      mockRequest as Request,
      mockResponse as Response,
      true,
      'Operation successful',
      200,
      { id: 1 }
    );

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: 'Operation successful',
      data: { id: 1 },
    });
  });

  it('should send an error response', () => {
    RoutesHandler.sendError(
      mockRequest as Request,
      mockResponse as Response,
      false,
      'An error occurred',
      500
    );

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: 'An error occurred',
      data: undefined,
    });
  });
});
