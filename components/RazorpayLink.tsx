import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import razorpayClient from "@/lib/razorpay";

const RazorpayLink = ({ user }: { user: any }) => {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const createOrder = async () => {
      const response = await fetch("/api/createOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 100, currency: "INR", userId: user.userId }), 
      });
      const data = await response.json();
      setOrderId(data.id);
    };

    createOrder();
  }, [user.userId]);

  const handlePayment = () => {
    const options = {
      key: process.env.RAZORPAY_KEY_ID, 
      amount: 100 * 100, 
      currency: "INR",
      name: "Bankify",
      description: "Link your bank account",
      order_id: orderId,
      handler: async (response: any) => {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
        await fetch("/api/savePaymentDetails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.userId,
            razorpay_payment_id,
          }),
        });
        router.push("/"); 
      },
      prefill: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div>
      <Button onClick={handlePayment} disabled={!orderId}>
        Link Bank Account
      </Button>
    </div>
  );
};

export default RazorpayLink;