import { Router } from "express";
import { createCoupon, listCoupons, assignCoupon } from "../controllers/adminCoupon.controller";
import { adminMiddleware } from "../middleware/admin.middleware";

const router = Router();

router.use(adminMiddleware);

router.post("/", createCoupon);
router.get("/", listCoupons); 
router.post("/:id/assign", assignCoupon);

export default router;
