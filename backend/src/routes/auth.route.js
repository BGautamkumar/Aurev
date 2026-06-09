import express from "express";
import { checkAuth, login, logout, signup, updateProfile, getUserProfile, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validate, schemas } from "../middleware/validate.middleware.js";

const router = express.Router();

router.post("/signup", validate(schemas.auth.signup), signup);
router.post("/login", validate(schemas.auth.login), login);
router.post("/logout", logout);

router.post("/forgot-password", validate(schemas.auth.forgotPassword), forgotPassword);
router.post("/reset-password/:token", validate(schemas.auth.resetPassword), resetPassword);

router.put("/update-profile", protectRoute, validate(schemas.profile.update), updateProfile);

router.get("/check", protectRoute, checkAuth);
router.get("/users/:userId", protectRoute, getUserProfile);

export default router;
