"use client";

import { useState, useEffect } from "react";

export default function Testimonials() {
  const testimonials = [
    {
      quote: "I never forget my medicines anymore. The reminders are perfectly timed.",
      author: "— Rahul, Bengaluru",
      rating: 5,
    },
    {
      quote: "Getting my parent's diabetic medicines refilled automatically every month has saved us so much time and stress.",
      author: "— Priya, Mumbai",
      rating: 5,
    },
    {
      quote: "Genuine medicines delivered at great discounts. The auto-refill subscription is a lifesaver.",
      author: "— Amit, Delhi",
      rating: 5,
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  // Auto scroll testimonials every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="testimonials-section" style={{ backgroundColor: "var(--bg-main)" }}>
      <div className="container">
        <h2 className="section-title-center" style={{ marginBottom: "24px" }}>
          What Our Customers Say
        </h2>
        
        <div className="testimonials-container">
          <div className="testimonial-slide">
            {/* Stars */}
            <div className="testimonial-rating">
              {"★".repeat(testimonials[activeIndex].rating)}
            </div>
            
            {/* Testimonial Quote */}
            <blockquote className="testimonial-quote">
              "{testimonials[activeIndex].quote}"
            </blockquote>
            
            {/* Author */}
            <cite className="testimonial-author">
              {testimonials[activeIndex].author}
            </cite>
          </div>
          
          {/* Navigation Dots */}
          <div className="testimonial-nav-dots">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`testimonial-dot ${activeIndex === idx ? "active" : ""}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
