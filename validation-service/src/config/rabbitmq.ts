import amqp from "amqplib";

export async function connectRabbitMQ() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://guest:guest@rabbitmq:5672");
  const channel = await connection.createChannel();
  await channel.assertExchange("coupon_exchange", "topic", { durable: true });
  const q = await channel.assertQueue("coupon_queue", { durable: true });
  await channel.bindQueue(q.queue, "coupon_exchange", "#"); // Listen to all events
  return channel;
}
