"use client";

import { useRouter } from "next/navigation";

export default function CategoryGrid() {
  const router = useRouter();

  const categories = [
    { name: "Medicines", emoji: "💊", link: "/medicines?category=general" },
    { name: "Heart", emoji: "❤️", link: "/medicines?category=cardiac" },
    { name: "Bone", emoji: "🦴", link: "/medicines?category=bone" },
    { name: "Baby", emoji: "👶", link: "/medicines?category=baby" },
    { name: "Diabetes", emoji: "🩺", link: "/medicines?category=diabetes" },
    { name: "Neuro", emoji: "🧠", link: "/medicines?category=neuro" },
    { name: "Ayurveda", emoji: "🌿", link: "/medicines?category=ayurveda" },
    { name: "Vitamins", emoji: "💪", link: "/medicines?category=vitamins" },
  ];

  return (
    <section className="category-section" style={{ backgroundColor: "#ffffff", borderTop: "1px solid var(--color-border-light)", borderBottom: "1px solid var(--color-border-light)" }}>
      <div className="container">
        <h2 className="section-title-center">Shop by Category</h2>
        <div className="category-grid">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="category-card"
              onClick={() => router.push(cat.link)}
            >
              <div className="category-icon-wrapper">{cat.emoji}</div>
              <span className="category-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
