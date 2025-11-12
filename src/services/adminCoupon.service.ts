import { AppDataSource } from "../config/data-source";
import { Coupon, CouponType } from "../entities/coupon.entity";
import { User } from "../entities/user.entity";
import { UserCoupon } from "../entities/userCoupon.entity";

export class AdminCouponService {
  private couponRepo = AppDataSource.getRepository(Coupon);
  private userRepo = AppDataSource.getRepository(User);
  private userCouponRepo = AppDataSource.getRepository(UserCoupon);

  // Create a new coupon (user-specific or time-specific)
  async createCoupon(data: {
    code: string;
    type: CouponType;
    validFrom?: Date;
    validUntil?: Date;
    maxUsagePerUser?: number;
    assignedUserId?: number; // for user-specific
  }) {
    const { assignedUserId, ...couponData } = data;

    const coupon = this.couponRepo.create(couponData);
    await this.couponRepo.save(coupon);

    // If user-specific, assign coupon to the user
    if (assignedUserId && data.type === CouponType.USER_SPECIFIC) {
      const user = await this.userRepo.findOne({ where: { id: assignedUserId } });
      if (!user) throw new Error("Assigned user not found");

      const userCoupon = this.userCouponRepo.create({
        user,
        coupon,
        usageCount: 0,
      });
      await this.userCouponRepo.save(userCoupon);
    }

    return coupon;
  }

  // List all coupons
  async listCoupons() {
    return this.couponRepo.find({ relations: ["userCoupons"] });
  }

  // Assign existing coupon to a user (for user-specific)
  async assignCouponToUser(couponId: number, userId: number) {
    const coupon = await this.couponRepo.findOne({ where: { id: couponId } });
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!coupon || !user) throw new Error("Coupon or User not found");
    if (coupon.type !== CouponType.USER_SPECIFIC)
      throw new Error("Only user-specific coupons can be assigned");

    const userCoupon = this.userCouponRepo.create({ coupon, user, usageCount: 0 });
    await this.userCouponRepo.save(userCoupon);

    return userCoupon;
  }
}
