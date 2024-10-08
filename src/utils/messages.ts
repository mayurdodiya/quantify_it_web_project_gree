const message = {
  DATA_EXIST: (str: string) => `${str} already exist!`,
  NO_DATA: (str: string) => `${str} doesn't exist!`,
  REQUIRED: (str: string) => `${str} required!`,

  GET_DATA: (str: string) => `${str} data get successfully!`,

  CREATE_SUCCESS: (str: string) => `${str} added successfully!`,
  CREATE_FAIL: (str: string) => `Failed to add ${str}. Please try again!`,

  UPDATED_SUCCESSFULLY: (str: string) => `${str} has been updated successfully!`,
  UPDATE_FAILED: (str: string) => `Failed to update ${str}. Please try again!`,

  DELETE_SUCCESS: (str: string) => `${str} data deleted successfully!`,
  ADD_ONCE: (str: string) => `${str} can only be added once. You cannot add it multiple times!`,
  SUBMIT_FORM: () => `Your form has been successfully submitted. Thank you for your submission!`,

  NOT_MATCH: (str: string) => `${str} not match!`,
  NOT_GENERATE: (str: string) => `${str} not generated!`,

  LOGIN_SUCCESS: (str: string) => `Welcome back, You have successfully logged in!`,

  NO_TOKEN: (str: string) => `No token provided!`,
  BAD_REQUEST: (str: string) => `Unauthorized!`,
  TOKEN_EXPIRED: (str: string) => `Unauthorized! Access Token was expired!`,
  
  UPLOAD_SUCCESS: (str: string) => `${str} upload successfully!`,
  
  UPLOAD_IMG: (str: string) => `Please upload a Image`,
  
};

export { message };
