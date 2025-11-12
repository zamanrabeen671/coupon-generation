import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { User } from "./user.entity";
import { Coupon } from "./coupon.entity";

export enum CouponType {
  USER_SPECIFIC = "USER_SPECIFIC",
  TIME_SPECIFIC = "TIME_SPECIFIC",
}

@Entity()
export class UserCoupon {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.userCoupons)
  user!: User;

  @ManyToOne(() => Coupon, (coupon) => coupon.userCoupons)
  coupon!: Coupon;

  @Column({ default: 0 })
  usageCount!: number;
}
