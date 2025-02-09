import { NextApiRequest, NextApiResponse } from "next";
import razorpayClient from "@/lib/razorpay";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { amount, currency, userId } = req.body;

    try {
      const order = await razorpayClient.orders.create({
        amount: amount * 100, 
        currency,
        receipt: `receipt_${userId}`,
      });

      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ error: "Error creating order" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}