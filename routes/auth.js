import { Router } from "express";
import validate from "../middlewares/validate.js";
import userValidation from "../validations/auth.js";
import authController from "../controllers/auth.js";
import { uploadBlogProfileImage } from "../middlewares/multerConfig.js";
import getUserfromAuthToken from "../middlewares/jwtFromUser.js";

const authRouter = Router();

authRouter.post(
  "/register",
  uploadBlogProfileImage,
  validate({ body: userValidation.register }),
  authController.register
);

authRouter.post(
  "/verify-email",
  validate({ body: userValidation.verifyEmail }),
  authController.verifyEmail
);

authRouter.post(
  "/login",
  validate({ body: userValidation.login }),
  authController.login
);

authRouter.put(
  "/become-a-writer",
  getUserfromAuthToken,
  authController.becomeAWriter
);

export default authRouter;
