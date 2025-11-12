import { AppDataSource } from "../config/data-source";
import { connectRabbitMQ } from "../config/rabbitmq";
import { Coupon, CouponType } from "../entities/coupon.entity";
import { User } from "../entities/user.entity";
import { UserCoupon } from "../entities/userCoupon.entity";

export class AdminCouponService {
  private couponRepo = AppDataSource.getRepository(Coupon);
  private userRepo = AppDataSource.getRepository(User);
  private userCouponRepo = AppDataSource.getRepository(UserCoupon);

  async createCoupon(data: {
    code: string;
    type: CouponType;
    validFrom?: Date;
    validUntil?: Date;
    maxUsagePerUser?: number;
    assignedUserId?: number;
  }) {
    const { assignedUserId, ...couponData } = data;

    const coupon = this.couponRepo.create(couponData);
    await this.couponRepo.save(coupon);

    // Publish event: coupon created
    const channel = await connectRabbitMQ();
    channel.publish(
      "coupon_exchange",
      "coupon_created",
      Buffer.from(JSON.stringify({ couponId: coupon.id, code: coupon.code, type: coupon.type }))
    );

    if (assignedUserId && data.type === CouponType.USER_SPECIFIC) {
      const user = await this.userRepo.findOne({ where: { id: assignedUserId } });
      if (!user) throw new Error("Assigned user not found");

      const userCoupon = this.userCouponRepo.create({ user, coupon, usageCount: 0 });
      await this.userCouponRepo.save(userCoupon);

      channel.publish(
        "coupon_exchange",
        "coupon_assigned",
        Buffer.from(JSON.stringify({ couponId: coupon.id, userId: user.id }))
      );
    }

    return coupon;
  }

  async listCoupons() {
    return this.couponRepo.find({ relations: ["userCoupons"] });
  }

  async assignCouponToUser(couponId: number, userId: number) {
    const coupon = await this.couponRepo.findOne({ where: { id: couponId } });
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!coupon || !user) throw new Error("Coupon or User not found");
    if (coupon.type !== CouponType.USER_SPECIFIC)
      throw new Error("Only user-specific coupons can be assigned");

    const userCoupon = this.userCouponRepo.create({ coupon, user, usageCount: 0 });
    await this.userCouponRepo.save(userCoupon);

    const channel = await connectRabbitMQ();
    channel.publish(
      "coupon_exchange",
      "coupon_assigned",
      Buffer.from(JSON.stringify({ couponId: coupon.id, userId: user.id }))
    );

    return userCoupon;
  }
}
