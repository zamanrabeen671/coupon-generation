import { AppDataSource } from "../config/data-source";
import { Coupon, CouponType } from "../entities/coupon.entity";
import { UserCoupon } from "../entities/userCoupon.entity";
import { User } from "../entities/user.entity";
import dayjs from "dayjs";

export class CouponService {
  private couponRepo = AppDataSource.getRepository(Coupon);
  private userCouponRepo = AppDataSource.getRepository(UserCoupon);
  private userRepo = AppDataSource.getRepository(User);

  async redeemCoupon(userId: number, code: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const coupon = await this.couponRepo.findOne({
      where: { code },
      relations: ["userCoupons"],
    });

    if (!coupon) throw new Error("Coupon not found");

    const now = dayjs();

    if (coupon.type === CouponType.TIME_SPECIFIC) {
      if (!coupon.validFrom || !coupon.validUntil)
        throw new Error("Coupon is not properly configured");

      if (now.isBefore(coupon.validFrom) || now.isAfter(coupon.validUntil))
        throw new Error("Coupon is expired or not yet active");

      let userCoupon = await this.userCouponRepo.findOne({
        where: { user: { id: user.id }, coupon: { id: coupon.id } },
      });

      if (!userCoupon) {
        userCoupon = this.userCouponRepo.create({
          user,
          coupon,
          usageCount: 0,
        });
      }

      if (userCoupon.usageCount >= coupon.maxUsagePerUser)
        throw new Error("Coupon usage limit exceeded for this user");

      userCoupon.usageCount += 1;
      await this.userCouponRepo.save(userCoupon);

      return {
        message: "Coupon applied successfully",
        discount: coupon.maxUsagePerUser,
      };
    }

    if (coupon.type === CouponType.USER_SPECIFIC) {
      const userCoupon = await this.userCouponRepo.findOne({
        where: { user: { id: user.id }, coupon: { id: coupon.id } },
      });

      if (!userCoupon) throw new Error("This coupon is not assigned to you");

      if (userCoupon.usageCount >= 1)
        throw new Error("Coupon already used");

      userCoupon.usageCount = 1;
      await this.userCouponRepo.save(userCoupon);

      return {
        message: "Coupon applied successfully",
        discount: coupon.maxUsagePerUser,
      };
    }

    throw new Error("Invalid coupon type");
  }
}
