import { Router } from "express";
import {
  getCurrentUserHandler,
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
  registerHandler,
} from "../controllers/authController";
import { requireAuth } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const authRouter = Router();

authRouter.post("/register", asyncHandler(registerHandler));
authRouter.post("/login", asyncHandler(loginHandler));
authRouter.post("/refresh", asyncHandler(refreshTokenHandler));
authRouter.post("/logout", asyncHandler(logoutHandler));
authRouter.get("/me", requireAuth, asyncHandler(getCurrentUserHandler));

export default authRouter;
