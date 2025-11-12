import { Router } from "express";
import { redeemCoupon } from "../controllers/coupon.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/redeem", authMiddleware, redeemCoupon);

export default router;
