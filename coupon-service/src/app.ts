import express from "express";
import { AppDataSource } from "./config/data-source";
import userRoutes from './routes/auth.routes';
import adminRoutes from './routes/adminCoupon.routes'
import dotenv from "dotenv";
import { connectRabbitMQ } from "./config/rabbitmq";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/admin", adminRoutes);

AppDataSource.initialize().then(async() => {

  console.log("Database connected");

  await connectRabbitMQ();

});

export default app;
