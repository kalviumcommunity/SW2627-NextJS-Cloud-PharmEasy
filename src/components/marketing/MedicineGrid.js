"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MedicineGrid() {
  const router = useRouter();

  const medicines = [
    {
      id: "crocin-650",
      name: "Crocin 650",
      emoji: "💊",
      price: 299,
      rating: 4,
      stars: "★★★★☆",
      link: "/medicines/crocin-650",
    },
    {
      id: "vitamin-c",
      name: "Vitamin C Effervescent",
      emoji: "🧃",
      price: 185,
      rating: 5,
      stars: "★★★★★",
      link: "/medicines/vitamin-c",
    },
    {
      id: "metformin-500",
      name: "Metformin 500",
      emoji: "💉",
      price: 92,
      rating: 4,
      stars: "★★★★☆",
      link: "/medicines/metformin-500",
    },
    {
      id: "calcium-d3",
      name: "Calcium + D3",
      emoji: "🩹",
      price: 410,
      rating: 5,
      stars: "★★★★★",
      link: "/medicines/calcium-d3",
    },
  ];

  return (
    <section style={{ backgroundColor: "#f9f8f4" }}>
      <div className="container">
        {/* Section Header */}
        <div className="popular-header">
          <h2>Popular Medicines</h2>
          <Link href="/medicines" className="see-all-link">
            See All
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Medicines Cards Grid */}
        <div className="medicine-grid">
          {medicines.map((med) => (
            <div key={med.id} className="medicine-card">
              <div className="medicine-card-header">{med.emoji}</div>
              <div className="medicine-card-body">
                <h3 className="medicine-title">{med.name}</h3>
                <div className="medicine-price">₹{med.price}</div>
                <div className="medicine-rating">
                  <span className="medicine-stars">{med.stars}</span>
                </div>
                <button
                  onClick={() => router.push(med.link)}
                  className="btn medicine-card-btn"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
