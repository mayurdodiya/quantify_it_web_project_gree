import { NextFunction, Request, Response } from "express";
import { check, query, validationResult } from "express-validator";
import logger from "./winston";

const validationHandler = (req: Request, res: Response, next: NextFunction) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorFormatter: any = ({ msg }) => {
    return `${msg}`;
  };

  const result = validationResult(req).formatWith(errorFormatter);
  if (!result.isEmpty()) {
    logger.info(result.array().join(", "));
    return res.status(422).json({ success: false, message: result.array().join(", ") });
  }
  next();
};

const addBannerValidation = [
  check("title").notEmpty().withMessage("Title is required"),
  check("banner_name").notEmpty().withMessage("Banner name is required"),
  check("pc_img_url").notEmpty().withMessage("Pc img url is required"),
  check("mobile_img_url").notEmpty().withMessage("Mobile img url is required"),
  check("description").optional().isArray().withMessage("Description must be an array."),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];
const updateBannerValidation = [
  check("description").optional().isArray().withMessage("Description must be an array."),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addVisionExpertiesValidation = [
  check("title").notEmpty().withMessage("Title is required"),
  check("description").notEmpty().withMessage("Description is required").isArray().withMessage("Description must be an array!"),
  check("img_url").notEmpty().withMessage("img url is required"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const updateVisionExpertiesValidation = [
  check("description").optional().isArray().withMessage("Description must be an array!"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addWhoWeAreValidation = [
  check("title").notEmpty().withMessage("Title is required"),
  check("description").notEmpty().withMessage("Description is required").isArray().withMessage("Description must be an array!"),
  check("who_we_are_img_url_1").notEmpty().withMessage("who_we_are_img_url_1 is required"),
  check("who_we_are_img_url_2").notEmpty().withMessage("who_we_are_img_url_1 is required"),
  check("total_experience").notEmpty().withMessage("total_experience is required"),
  check("talented_it_professionals").notEmpty().withMessage("talented_it_professionals is required"),
  check("successfull_projects").notEmpty().withMessage("successfull_projects is required"),
  check("served_country").notEmpty().withMessage("served_country is required"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const updateWhoWeAreValidation = [
  check("description").optional().isArray().withMessage("Description must be an array!"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addCoreServiceValidation = [
  check("service_type").notEmpty().withMessage("service type is required"),
  check("img_url").notEmpty().withMessage("img url is required"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addSubServiceValidation = [
  check("core_service_id").notEmpty().withMessage("Core service type is required"),
  // check("sub_service_data").isArray().withMessage("sub service data must be provided as an array!"),
  check("description").optional().isArray().withMessage("Description must be an array!"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const updateSubServiceValidation = [
  check("description").optional().isArray().withMessage("description data must be provided as an array!"),
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addTechExpertiesValidation = [
  check("experties_type").notEmpty().withMessage("Experties type is required"),
  check("experties_name").notEmpty().withMessage("Experties name is required"),
  check("img_url").notEmpty().withMessage("img url is required"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addPortfolioValidation = [
  check("portfolio_type_id").notEmpty().withMessage("Portfolio type is required"),
  check("title").notEmpty().withMessage("Title is required"),
  check("sub_title").notEmpty().withMessage("Sub title is required"),
  check("img_url").notEmpty().withMessage("img url is required"),
  check("description").optional().isArray().withMessage("description is must be in array!"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const updatePortfolioValidation = [
  check("description").optional().isArray().withMessage("description is must be in array!"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addPortfolioTypeValidation = [
  check("type_name").notEmpty().withMessage("Type name is required"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addTrustedClientsValidation = [
  check("client_name").notEmpty().withMessage("Client name is required"),
  check("his_profession").notEmpty().withMessage("Profession is required"),
  check("description").notEmpty().withMessage("Description is required").isArray().withMessage("Description is must in array!"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const updateTrustedClientsValidation = [
  check("description").optional().isArray().withMessage("Description is must in array!"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addServicesClientsValidation = [
  check("client_name").notEmpty().withMessage("Client name is required"),
  check("his_profession").notEmpty().withMessage("Profession is required"),
  check("rating").notEmpty().withMessage("Rating is required"),
  check("description").notEmpty().withMessage("Description is required").isArray().withMessage("Description is must in array!"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const updateServicesClientsValidation = [
  check("description").optional().isArray().withMessage("Description is must in array!"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addblogValidation = [
  check("blog_title").notEmpty().withMessage("Blog title is required"),
  check("description").notEmpty().withMessage("Description is required").isArray().withMessage("Description must be an array!"),
  check("img_url").notEmpty().withMessage("Img url is required"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const updateblogValidation = [
  check("description").optional().isArray().withMessage("Description must be an array!"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addQuestionAnsValidation = [
  check("question").notEmpty().withMessage("Question is required"),
  check("answer").notEmpty().withMessage("Answer is required"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addAboutUsValidation = [
  check("title").notEmpty().withMessage("title is required"),
  check("description").notEmpty().withMessage("Description is required").isArray().withMessage("Description must be an array!"),
  check("who_we_are_img_url_1").notEmpty().withMessage("who_we_are_img_url_1 is required"),
  check("who_we_are_img_url_2").notEmpty().withMessage("who_we_are_img_url_2 is required"),
  check("our_vision").notEmpty().withMessage("our_vision is required").isArray().withMessage("Our vision must be an array!"),
  check("our_mission").notEmpty().withMessage("our_mission is required").isArray().withMessage("Our mission must be an array!"),
  check("vision_mission_img_url").notEmpty().withMessage("vision_mission_img_url is required"),
  check("works_about_title").notEmpty().withMessage("works_about_title is required"),
  check("works_about_description").notEmpty().withMessage("works_about_description is required").isArray().withMessage("Description must be an array!"),
  check("works_about_img_url").notEmpty().withMessage("works_about_img_url is required"),
  check("total_experience").notEmpty().withMessage("total_experience is required"),
  check("talented_it_professionals").notEmpty().withMessage("talented_it_professionals is required"),
  check("successfull_projects").notEmpty().withMessage("successfull_projects is required"),
  check("served_country").notEmpty().withMessage("served_country is required"),
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];
const updateAboutUsValidation = [
  check("description").optional().isArray().withMessage("Description must be an array!"),
  check("our_vision").optional().isArray().withMessage("Our vision must be an array!"),
  check("our_mission").optional().isArray().withMessage("Our mission must be an array!"),
  check("works_about_description").optional().isArray().withMessage("Description must be an array!"),
  check("total_experience").optional(),
  check("talented_it_professionals").optional(),
  check("successfull_projects").optional(),
  check("served_country").optional(),
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addCertificationValidation = [
  check("who_we_are_id").notEmpty().withMessage("who_we_are_id is required"),
  check("sub_title").notEmpty().withMessage("Sub title is required"),
  check("sub_description").notEmpty().withMessage("Sub description is required").isArray().withMessage("Sub description must be an array!"),
  check("logo_img_url").notEmpty().withMessage("logo img url is required"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];
const updateHowWeWorkValidation = [
  check("description").optional().isArray().withMessage("Description must be an array!"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const updateCertificationValidation = [
  check("description").optional().isArray().withMessage("Description must be an array!"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addHowWeWorkValidation = [
  check("title").notEmpty().withMessage("Title is required"),
  check("description").notEmpty().withMessage("Description is required").isArray().withMessage("Description must be an array!"),
  check("logo_img_url").notEmpty().withMessage("logo img url is required"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addEmployeeDetailsValidation = [
  check("name").notEmpty().withMessage("name is required"),
  check("img_url").notEmpty().withMessage("Img url is required"),
  check("description").notEmpty().withMessage("Description is required").isArray().withMessage("Description must be an array!"),

  check("rating").notEmpty().withMessage("Rating is required"),
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];
const updateEmployeeDetailsValidation = [
  check("description").optional().isArray().withMessage("Description must be an array!"),

  check("rating").optional(),
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addprovidedServiceValidation = [
  check("card_img_url").notEmpty().withMessage("card_img_url is required"),
  check("service_type").notEmpty().withMessage("service_type is required"),
  check("service_name").notEmpty().withMessage("service_name is required"),
  check("service_name_title").notEmpty().withMessage("service_name_title is required"),
  check("description").notEmpty().withMessage("Description is required").isArray().withMessage("Description must be an array!"),
  check("service_benifits").notEmpty().withMessage("service_benifits is required").isArray().withMessage("Service benifities must be an array!"),
  check("work_planning_title").notEmpty().withMessage("work_planning_title is required"),
  check("work_planning_description").notEmpty().withMessage("work_planning_description is required").isArray().withMessage("Description must be an array!"),
  check("work_planning_img_url").notEmpty().withMessage("work_planning_img_url is required"),
  check("business_solutions_title").notEmpty().withMessage("business_solutions_title is required"),
  check("business_solutions_description").notEmpty().withMessage("business_solutions_description is required").isArray().withMessage("Description must be an array!"),
  check("business_solutions_img_url").notEmpty().withMessage("business_solutions_img_url is required"),
  check("completed_works").notEmpty().withMessage("completed_works is required"),
  check("client_ratings").notEmpty().withMessage("client_ratings is required"),
  check("bussiness_reports_percentage").notEmpty().withMessage("bussiness_reports_percentage is required"),
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];
const updateprovidedServiceValidation = [
  check("description").optional().isArray().withMessage("Description must be an array!"),
  check("service_benifits").optional().isArray().withMessage("Service benifities must be an array!"),

  check("work_planning_description").optional().isArray().withMessage("work_planning_description must be an array!"),
  check("business_solutions_description").optional().isArray().withMessage("business_solutions_description must be an array!"),

  check("client_ratings").optional(),
  check("bussiness_reports_percentage").optional(),
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addfeaturedServicesValidation = [
  check("title").notEmpty().withMessage("Title is required"),
  check("description").notEmpty().withMessage("Description is required").isArray().withMessage("Description must be an array!"),
  check("logo_img_url").notEmpty().withMessage("logo img url is required"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];
const updatefeaturedServicesValidation = [
  check("description").optional().isArray().withMessage("Description must be an array!"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addOurContactDetailsValidation = [
  check("phone_no")
    .notEmpty()
    .withMessage("Phone no is required")
    .custom((value) => {
      if (typeof value !== "string") {
        throw new Error("phone_no must be in string format!");
      }
      return true;
    }),
  check("email").notEmpty().withMessage("Email is required"),
  check("location").notEmpty().withMessage("Location is required"),
  check("address").notEmpty().withMessage("Address is required"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const updateOurContactDetailsValidation = [
  check("phone_no")
    .optional()
    .custom((value) => {
      if (typeof value !== "string") {
        throw new Error("phone_no must be in string format!");
      }
      return true;
    }),
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addMarketingValidation = [
  check("marketing_type").notEmpty().withMessage("Marketing type is required").isInt().withMessage("Marketing type must be in integer!"),
  check("referred_by")
    .notEmpty()
    .withMessage("Referred by is required")
    .custom((value) => {
      if (value !== true && value !== false) {
        throw new Error("referred_by must be strictly true or false");
      }
      return true;
    }),
  check("business_stage").notEmpty().withMessage("Business stage is required").isInt().withMessage("Business stage must be in integer!"),
  check("full_name").notEmpty().withMessage("Full name is required"),
  check("email").notEmpty().withMessage("Email is required"),
  check("location").notEmpty().withMessage("Location is required"),
  check("company_name").notEmpty().withMessage("Company name is required"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addContactUsValidation = [
  check("full_name").notEmpty().withMessage("Full name is required"),
  check("email").notEmpty().withMessage("Email is required"),
  check("contact_purpose").notEmpty().withMessage("Contact purpose is required"),
  check("initial_budget")
    .notEmpty()
    .withMessage("initial_budget is required")
    .custom((value) => {
      if (typeof value !== "string") {
        throw new Error("initial_budget value must be in string format!");
      }
      return true;
    }),
  check("closing_budget")
    .notEmpty()
    .withMessage("closing_budget is required")
    .custom((value) => {
      if (typeof value !== "string") {
        throw new Error("closing_budget value must be in string format!");
      }
      return true;
    }),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addPolicyAndTermsValidation = [
  check("document_type").notEmpty().withMessage("Document type is required").isInt().withMessage("Document type is must be integer!"),
  check("subject").notEmpty().withMessage("Subject is required"),
  check("explanation").notEmpty().withMessage("Explanation is required").isArray().withMessage("Explanation must be in array!"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const updatePolicyAndTermsValidation = [
  check("explanation").optional().isArray().withMessage("Explanation must be in array!"),
  check("document_type").optional().isInt().withMessage("Document type is must be integer!"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const policyAndTermsQueryValidation = [
  query("document_type").notEmpty().withMessage("Query parameter 'document_type' is required and must be either 'terms_condition' or 'privacy_policy'."),
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const portfolioQueryValidation = [
  query("page").notEmpty().withMessage("Query parameter 'page' is required!"),
  query("size").notEmpty().withMessage("Query parameter 'size' is required!"),
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const pageAndSizeQueryValidation = [
  query("page")
    .notEmpty()
    .withMessage("Query parameter 'page' is required!")
    .custom((value) => {
      if (value == 0) {
        throw new Error("Page size must be greater than 0. Please provide a valid size.");
      }
      return true;
    }),
  query("size")
    .notEmpty()
    .withMessage("Query parameter 'size' is required!")
    .custom((value) => {
      if (value == 0) {
        throw new Error("Size must be greater than 0. Please provide a valid size.");
      }
      return true;
    }),
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const loginValidation = [
  check("email").notEmpty().withMessage("email is required"),
  check("password").notEmpty().withMessage("password is required"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const emailValidation = [
  check("email").notEmpty().withMessage("email is required"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const serPassValidation = [
  check("token").notEmpty().withMessage("token is required"),
  check("password").notEmpty().withMessage("password is required"),
  check("confirmPassword").notEmpty().withMessage("Confirm Password is required"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const changePasswordValidation = [
  check("userId").notEmpty().withMessage("User's Id is required"),
  check("oldpassword").notEmpty().withMessage("Old Password is required"),
  check("newPassword").notEmpty().withMessage("New Password is required"),
  check("confirmPassword").notEmpty().withMessage("Confirm Password is required"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const changeStatusValidation = [
  check("status").notEmpty().withMessage("Status is required").isBoolean().withMessage("Status must be a boolean"),
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const addUserValidation = [
  check("first_name").notEmpty().withMessage("First name is required"),
  check("last_name").notEmpty().withMessage("Last name is required"),
  check("email").notEmpty().withMessage("Email is required"),
  check("phone_no").notEmpty().withMessage("Phone no is required"),
  check("password").notEmpty().withMessage("Password is required").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const changeStatusNotificationValidation = [
  check("is_read").notEmpty().withMessage("is_read is required"),
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

const imgValidation = [
  check("image").notEmpty().withMessage("please upload image!"),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

export { addBannerValidation, addVisionExpertiesValidation, updateVisionExpertiesValidation, addWhoWeAreValidation, updateWhoWeAreValidation, addCoreServiceValidation, addSubServiceValidation, updateSubServiceValidation, addTechExpertiesValidation, addPortfolioValidation, updatePortfolioValidation, addPortfolioTypeValidation, addTrustedClientsValidation, updateTrustedClientsValidation, addServicesClientsValidation, updateServicesClientsValidation, addblogValidation, updateblogValidation, addQuestionAnsValidation, addAboutUsValidation, updateAboutUsValidation, addCertificationValidation, updateHowWeWorkValidation, updateCertificationValidation, addHowWeWorkValidation, addEmployeeDetailsValidation, updateEmployeeDetailsValidation, addprovidedServiceValidation, updateprovidedServiceValidation, addfeaturedServicesValidation, updatefeaturedServicesValidation, addOurContactDetailsValidation, updateOurContactDetailsValidation, addMarketingValidation, addContactUsValidation, addPolicyAndTermsValidation, updatePolicyAndTermsValidation, policyAndTermsQueryValidation, portfolioQueryValidation, pageAndSizeQueryValidation, updateBannerValidation, loginValidation, imgValidation, emailValidation, addUserValidation, changeStatusValidation, changePasswordValidation, serPassValidation,changeStatusNotificationValidation };
