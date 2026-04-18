
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";

function Pricing() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("starter");
  const [loadingPlan, setLoadingPlan] = useState(null);

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "₹0",
      credits: 100,
      badge: "Default",
      description: "Perfect for beginners starting interview preparation.",
      features: [
        "100 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
    },
    {
      id: "starter",
      name: "Starter Pack",
      price: "₹100",
      credits: 150,
      description: "Great for focused practice and skill improvement.",
      features: [
        "150 AI Interview Credits",
        "Detailed Feedback",
        "Performance Analytics",
        "Full Interview History",
      ],
    },
    {
      id: "pro",
      name: "Pro Pack",
      price: "₹500",
      credits: 650,
      badge: "Best Value",
      highlight: true,
      description: "Best value for serious job preparation.",
      features: [
        "650 AI Interview Credits",
        "Advanced AI Feedback",
        "Skill Trend Analysis",
        "Priority AI Processing",
      ],
    },
  ];

  
  const handlePayment = async (plan) => {
    try {
      setLoadingPlan(plan.id);


      const res = await fetch(`${ServerUrl}/api/payment/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          planId: plan.id,
          amount: parseInt(plan.price.replace("₹", "")),
          credits: plan.credits,
        }),
      });

      const order = await res.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "InterviewIQ AI",
        description: plan.name,
        order_id: order.id,

        handler: async function (response) {
      
          await fetch(`${ServerUrl}/api/payment/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(response),
          });

          alert("Payment Successful!");
        },

        prefill: {
          name: "User",
          email: "user@example.com",
        },

        theme: {
          color: "#10b981",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error(error);
      alert("Payment failed");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6faf9] px-6 py-12">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex items-center justify-center relative mb-10">
        <button
          onClick={() => navigate("/")}
          className="absolute left-0 p-3 bg-white rounded-full shadow hover:shadow-md"
        >
          <FaArrowLeft />
        </button>

        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            Choose Your Plan
          </h1>
          <p className="text-gray-500 mt-2">
            Flexible pricing to match your interview preparation goals
          </p>
        </div>
      </div>

      {/* CARDS */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.03 }}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative rounded-3xl p-8 cursor-pointer transition bg-white shadow-md border
              ${isSelected ? "ring-2 ring-emerald-400 shadow-xl" : ""}
              ${plan.highlight ? "border-emerald-500" : "border-gray-100"}
              `}
            >
              {/* BADGE */}
              {plan.badge && (
                <span
                  className={`absolute top-4 right-4 text-xs px-3 py-1 rounded-full
                  ${
                    plan.badge === "Best Value"
                      ? "bg-emerald-600 text-white font-bold"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {plan.badge}
                </span>
              )}

              {/* NAME */}
              <h2 className="text-xl font-semibold text-gray-800">
                {plan.name}
              </h2>

              {/* PRICE */}
              <p className="text-3xl font-bold text-emerald-600 mt-2">
                {plan.price}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {plan.credits} Credits
              </p>

              <p className="text-gray-600 mt-4 text-sm">
                {plan.description}
              </p>

              {/* FEATURES */}
              <ul className="mt-5 space-y-2 text-sm text-gray-600">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <FaCheckCircle className="text-emerald-500 text-sm" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* BUTTON */}
              {!isSelected ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan.id);
                  }}
                  className="mt-6 w-full bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300 transition"
                >
                  Select Plan
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePayment(plan);
                  }}
                  className="mt-6 w-full bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 transition"
                >
                  {loadingPlan === plan.id ? "Processing..." : "Proceed to Pay"}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default Pricing;
