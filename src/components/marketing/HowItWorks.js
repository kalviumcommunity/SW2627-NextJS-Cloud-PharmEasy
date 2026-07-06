"use client";

export default function HowItWorks() {
  const steps = [
    {
      step: "STEP 01",
      name: "Choose Medicine",
      emoji: "💊",
    },
    {
      step: "STEP 02",
      name: "Select Schedule",
      emoji: "📅",
    },
    {
      step: "STEP 03",
      name: "Secure Payment",
      emoji: "💳",
    },
    {
      step: "STEP 04",
      name: "Automatic Delivery",
      emoji: "🚚",
    },
  ];

  return (
    <section style={{ backgroundColor: "#f9f8f4" }}>
      <div className="container">
        <h2 className="section-title-center">How Auto Refill Works</h2>
        
        <div className="how-it-works-grid">
          {/* Dotted connector line */}
          <div className="how-it-works-line"></div>
          
          {steps.map((item, idx) => (
            <div key={idx} className="step-card">
              <div className="step-icon-circle">{item.emoji}</div>
              <div className="step-label">{item.step}</div>
              <h3 className="step-name">{item.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
