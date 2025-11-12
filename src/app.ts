import express from "express";
import { AppDataSource } from "./config/data-source";
import couponRoutes from "./routes/coupon.routes";
import userRoutes from './routes/auth.routes';
import adminRoutes from './routes/adminCoupon.routes'
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/admin", adminRoutes);

AppDataSource.initialize().then(() => {
  console.log("Database connected");
});

export default app;
