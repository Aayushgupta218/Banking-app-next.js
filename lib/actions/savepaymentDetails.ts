import { NextApiRequest, NextApiResponse } from "next";
import { createAdminClient } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { userId, razorpay_payment_id } = req.body;

    try {
      const { database } = await createAdminClient();

      await database.createDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_TRANSACTION_COLLECTION_ID!,
        ID.unique(),
        {
          userId,
          razorpay_payment_id,
        }
      );

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Error saving payment details" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}