import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { UserCoupon } from "./userCoupon.entity";

export enum CouponType {
  USER_SPECIFIC = "USER_SPECIFIC",
  TIME_SPECIFIC = "TIME_SPECIFIC",
}

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  code!: string;

  @Column({
    type: "enum",
    enum: CouponType,
    default: CouponType.TIME_SPECIFIC,
  })
  type!: CouponType;

  @Column({ type: "timestamp", nullable: true })
  validFrom!: Date;

  @Column({ type: "timestamp", nullable: true })
  validUntil!: Date;

  @Column({ type: "int", default: 1 })
  maxUsagePerUser!: number;

  @OneToMany(() => UserCoupon, (uc) => uc.coupon)
  userCoupons!: UserCoupon[];
}
