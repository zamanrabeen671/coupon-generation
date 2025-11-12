import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { UserCoupon } from "./userCoupon.entity";

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @OneToMany(() => UserCoupon, (uc) => uc.user)
  userCoupons!: UserCoupon[];
}
