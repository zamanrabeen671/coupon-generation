import { connectRabbitMQ } from "../config/rabbitmq";
import { AppDataSource } from "../config/data-source";
import { Coupon } from "../entities/coupon.entity";
import { UserCoupon } from "../entities/userCoupon.entity";

interface CouponCache {
  [code: string]: {
    id: number;
    type: string;
    validFrom?: Date;
    validUntil?: Date;
    maxUsagePerUser?: number;
    assignedUsers?: number[];
  };
}

export class EventListenerService {
  private couponRepo = AppDataSource.getRepository(Coupon);
  private userCouponRepo = AppDataSource.getRepository(UserCoupon);

  // In-memory cache for demonstration
  public couponCache: CouponCache = {};

  async start() {
    const channel = await connectRabbitMQ();

    console.log("Validation-service RabbitMQ consumer started...");

    channel.consume("coupon_queue", async (msg) => {
      if (!msg) return;

      const event = JSON.parse(msg.content.toString());

      switch (msg.fields.routingKey) {
        case "coupon_created":
          console.log("Coupon created event received:", event);

          this.couponCache[event.code] = {
            id: event.couponId,
            type: event.type,
            validFrom: event.validFrom ? new Date(event.validFrom) : undefined,
            validUntil: event.validUntil ? new Date(event.validUntil) : undefined,
            maxUsagePerUser: event.maxUsagePerUser || 1,
            assignedUsers: [],
          };
          break;

        case "coupon_assigned":
          console.log("Coupon assigned event received:", event);

          for (const key in this.couponCache) {
            if (this.couponCache[key].id === event.couponId) {
              if (!this.couponCache[key].assignedUsers) {
                this.couponCache[key].assignedUsers = [];
              }
              this.couponCache[key].assignedUsers.push(event.userId);
            }
          }
          break;

        default:
          console.log("Unknown event:", msg.fields.routingKey);
      }

      channel.ack(msg);
    });
  }

  canUserRedeem(code: string, userId: number): boolean {
    const coupon = this.couponCache[code];
    if (!coupon) return false;

    if (coupon.type === "USER_SPECIFIC") {
      return coupon.assignedUsers?.includes(userId) ?? false;
    }

    return true;
  }
}
