"use client";

import { FREQUENCY, FREQUENCY_LABEL } from "@/lib/utils/constants";

const OPTIONS = [FREQUENCY.DAILY, FREQUENCY.WEEKLY, FREQUENCY.MONTHLY];

export default function FrequencySelector({ value, onChange, name = "frequency", disabled = false }) {
  return (
    <div className="subscribe-frequency-group">
      <label style={{ fontSize: "15px", fontWeight: "600", color: "var(--color-text-main)" }}>
        Select Refill Frequency:
      </label>

      <div className="frequency-options">
        {OPTIONS.map((option) => {
          const id = `${name}-${option.toLowerCase()}`;
          return (
            <div key={option}>
              <input
                type="radio"
                id={id}
                name={name}
                value={option}
                className="frequency-radio"
                checked={value === option}
                disabled={disabled}
                onChange={() => onChange(option)}
              />
              <label htmlFor={id} className="frequency-option-label">
                {FREQUENCY_LABEL[option]}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}