import { Request, Response } from "express";
import { CouponService } from "../services/coupon.service";

const couponService = new CouponService();

export const redeemCoupon = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { code } = req.body;

    const result = await couponService.redeemCoupon(userId, code);

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
