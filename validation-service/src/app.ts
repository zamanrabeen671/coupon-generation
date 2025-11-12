import express from "express";
import { AppDataSource } from "./config/data-source";
import couponRoutes from "./routes/coupon.routes";
import userRoutes from './routes/auth.routes';
import dotenv from "dotenv";
import { EventListenerService } from "./services/event-listner.service";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/auth", userRoutes);

AppDataSource.initialize().then(async () => {
  console.log("Database connected");

  const listener = new EventListenerService();
  await listener.start();
});

export default app;
