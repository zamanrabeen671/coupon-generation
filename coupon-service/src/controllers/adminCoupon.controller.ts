import { Request, Response } from "express";
import { AdminCouponService } from "../services/adminCoupon.service";

const service = new AdminCouponService();

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await service.createCoupon(req.body);
    res.json({ success: true, coupon });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const listCoupons = async (_req: Request, res: Response) => {
  try {
    const coupons = await service.listCoupons();
    res.json({ success: true, coupons });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const assignCoupon = async (req: Request, res: Response) => {
  try {
    const couponId = parseInt(req.params.id);
    const { userId } = req.body;
    const userCoupon = await service.assignCouponToUser(couponId, userId);
    res.json({ success: true, userCoupon });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
