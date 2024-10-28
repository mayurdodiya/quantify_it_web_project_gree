import * as express from "express";
import bannerRoute from "./banner.route";
import visionExpertiesRoute from "./vision_experties.route";
import coreServiceRoute from "./core_services.route";
import subServiceRoute from "./sub_services.route";
import technologicalExpertiesRoute from "./technological_experties.route";
import portfolioRoute from "./portfolio.route";
import trustedClientsRoute from "./trusted_clients.route";
import serviceClientsRoute from "./service_clients.route";
import blogRoute from "./blog.route";
import questionAnsRoute from "./question_ans.route";
import aboutUsRoute from "./about_us.route";
import certificationDetailsRoute from "./certification_details.route";
import howWeWorkRoute from "./how_we_work.route";
import employeeDetailsRoute from "./employee_details.route";
import providedServiceRoute from "./provided_service.route";
import featuredServicesRoute from "./featured_services.route";
import ourContactDetailsRoute from "./our_contact_details.route";
import marketingRoute from "./marketing.route";
import contactUsRoute from "./contact_us.route";
import termsAndConditionRoute from "./policy_and_terms.route";
import adminRoute from "./admin.route";
import chatBoatRoute from "./chat_boat.route";
import tokenRoute from "./token.route";
import subAdminRoute from "./sub_admin.route";
import portfolioTypeRoute from "./portfolio_type.route";
import whoWeAreRoute from "./who_we_are.route";
import notificationRoute from "./notification.route";
import { verifyGlobalToken } from "../utils/auth.token";

const Routes = express.Router();

Routes.use("/admin", adminRoute);
Routes.use("/banner", verifyGlobalToken, bannerRoute);
Routes.use("/visionexperties", verifyGlobalToken, visionExpertiesRoute);
Routes.use("/whoweare", verifyGlobalToken, whoWeAreRoute);
Routes.use("/coreservice", verifyGlobalToken, coreServiceRoute);
Routes.use("/subservice", verifyGlobalToken, subServiceRoute);
Routes.use("/techexperties", verifyGlobalToken, technologicalExpertiesRoute);
Routes.use("/portfolio", verifyGlobalToken, portfolioRoute);
Routes.use("/portfoliotype", verifyGlobalToken, portfolioTypeRoute);
Routes.use("/trustedclients", verifyGlobalToken, trustedClientsRoute);
Routes.use("/serviceclients", verifyGlobalToken, serviceClientsRoute);
Routes.use("/blog", verifyGlobalToken, blogRoute);
Routes.use("/questionans", verifyGlobalToken, questionAnsRoute);
Routes.use("/aboutus", verifyGlobalToken, aboutUsRoute);
Routes.use("/certification", verifyGlobalToken, certificationDetailsRoute);
Routes.use("/howwework", verifyGlobalToken, howWeWorkRoute);
Routes.use("/employee", verifyGlobalToken, employeeDetailsRoute);
Routes.use("/serviceprovide", verifyGlobalToken, providedServiceRoute);
Routes.use("/featuredservice", verifyGlobalToken, featuredServicesRoute);
Routes.use("/contactdetail", verifyGlobalToken, ourContactDetailsRoute);
Routes.use("/marketing", verifyGlobalToken, marketingRoute);
Routes.use("/contactus", verifyGlobalToken, contactUsRoute);
Routes.use("/termscondition", verifyGlobalToken, termsAndConditionRoute);
Routes.use("/chat", verifyGlobalToken, chatBoatRoute);
Routes.use("/token", tokenRoute);
Routes.use("/subadmin", subAdminRoute);
Routes.use("/notification", notificationRoute);

export default Routes;
