"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import MedicineVisual from "@/components/medicines/MedicineVisual";

const CATEGORIES = ["All", "Diabetes", "Hypertension", "Thyroid", "Cardiac", "Supplements"];

export default function MedicinesClient({
  initialMedicines,
  initialQuery,
  initialCategory,
  isLoggedIn,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState(initialCategory || "All");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setActiveCategory(searchParams.get("category") || "All");
  }, [searchParams]);

  function handleSearchChange(e) {
    const value = e.target.value;
    setQuery(value);
    updateParams(value, activeCategory);
  }

  function handleCategoryClick(category) {
    setActiveCategory(category);
    updateParams(query, category);
  }

  function updateParams(q, cat) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat && cat !== "All") params.set("category", cat);

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="meds-page-container">
      {/* Header Area */}
      <div className="meds-header-area">
        <div>
          <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Explore Medicines</h1>
          <p style={{ color: "var(--color-text-muted)" }}>
            Search genuine prescription medicines and health supplements
          </p>
        </div>

        {/* Search Bar */}
        <div className="meds-search-bar">
          <div className="search-wrapper">
            <svg
              className="search-icon-inline"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by name, description..."
              value={query}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {/* Category Pills Row */}
      <div className="meds-filter-row">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`filter-btn ${activeCategory === cat ? "active" : ""}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Medicines Grid */}
      {initialMedicines.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h2>No Medicines Found</h2>
          <p>We couldn't find any medicines matching your search criteria. Try a different query or category.</p>
        </div>
      ) : (
        <div className="medicine-grid">
          {initialMedicines.map((med) => (
            <div key={med.id} className="medicine-card">
              <div className={`medicine-card-header cat-${med.category?.toLowerCase()}`}>
                <MedicineVisual category={med.category} name={med.name} imageUrl={med.imageUrl} />
              </div>
              <div className="medicine-card-body">
                <span className="badge badge-active" style={{ fontSize: "10px", marginBottom: "8px", backgroundColor: "var(--bg-mint)" }}>
                  {med.category}
                </span>
                <h3 className="medicine-title">{med.name}</h3>
                <p style={{ fontSize: "13px", color: "var(--color-text-muted)", height: "38px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginBottom: "12px" }}>
                  {med.description}
                </p>
                <div className="medicine-price" style={{ marginBottom: "16px" }}>₹{med.price}</div>

                <Link href={`/medicines/${med.id}`} style={{ textDecoration: "none", width: "100%" }}>
                  <button className="btn medicine-card-btn" style={{ width: "100%", justifyContent: "center" }}>
                    View Subscription Details
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}