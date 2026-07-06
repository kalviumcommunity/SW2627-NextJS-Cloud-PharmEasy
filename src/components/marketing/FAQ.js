"use client";

import { useState } from "react";

export default function FAQ() {
  const faqs = [
    {
      question: "How do subscriptions work?",
      answer: "You select your required medicines, set the delivery frequency (daily, weekly, or monthly), and choose a payment method. We'll automatically schedule and process your orders on time, so you never run out of doses.",
    },
    {
      question: "Can I pause anytime?",
      answer: "Yes, you can pause any active subscription with a single click from your subscription dashboard. We'll stop deliveries immediately until you decide to resume.",
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely. There are no cancellation fees or lock-in periods. You can cancel your medicine refills at any time via the portal.",
    },
    {
      question: "What if payment fails?",
      answer: "If a scheduled payment fails, we'll notify you immediately via email and SMS. We will retry the payment automatically up to 3 times before pausing the subscription to ensure you have time to update your details.",
    },
    {
      question: "How are reminders sent?",
      answer: "We send reminders about upcoming refills 3 days in advance via email, SMS, and dashboard notifications. This gives you plenty of time to add/remove items or adjust dates if needed.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <section style={{ backgroundColor: "#ffffff" }}>
      <div className="container">
        <h2 className="section-title-center">Frequently Asked Questions</h2>
        
        <div className="faq-container">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`faq-item ${openIndex === idx ? "active" : ""}`}
            >
              <button
                className="faq-trigger"
                onClick={() => toggleFAQ(idx)}
                aria-expanded={openIndex === idx}
              >
                <span>{faq.question}</span>
                <span className="faq-icon">+</span>
              </button>
              
              <div className="faq-content">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
