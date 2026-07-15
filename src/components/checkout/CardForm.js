"use client";

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function CardForm({ card, onChange, error, disabled }) {
  function update(field, value) {
    onChange({ ...card, [field]: value });
  }

  return (
    <div className="card-form">
      <div className="card-form-banner">
        🔒 Simulated payment — no real transaction is processed, this is a
        demo card form for the assignment.
      </div>

      {error && <div className="auth-error-msg">{error}</div>}

      <div className="auth-form-group">
        <label className="auth-form-label" htmlFor="card-name">
          Name on Card
        </label>
        <div className="auth-input-wrapper">
          <input
            id="card-name"
            className="auth-input"
            type="text"
            placeholder="Jane Doe"
            value={card.cardName}
            disabled={disabled}
            onChange={(e) => update("cardName", e.target.value)}
          />
        </div>
      </div>

      <div className="auth-form-group">
        <label className="auth-form-label" htmlFor="card-number">
          Card Number
        </label>
        <div className="auth-input-wrapper">
          <input
            id="card-number"
            className="auth-input"
            type="text"
            inputMode="numeric"
            placeholder="4242 4242 4242 4242"
            maxLength={19}
            value={card.cardNumber}
            disabled={disabled}
            onChange={(e) => update("cardNumber", formatCardNumber(e.target.value))}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "16px" }}>
        <div className="auth-form-group" style={{ flex: 1 }}>
          <label className="auth-form-label" htmlFor="card-expiry">
            Expiry (MM/YY)
          </label>
          <div className="auth-input-wrapper">
            <input
              id="card-expiry"
              className="auth-input"
              type="text"
              inputMode="numeric"
              placeholder="MM/YY"
              maxLength={5}
              value={card.expiry}
              disabled={disabled}
              onChange={(e) => update("expiry", formatExpiry(e.target.value))}
            />
          </div>
        </div>

        <div className="auth-form-group" style={{ flex: 1 }}>
          <label className="auth-form-label" htmlFor="card-cvv">
            CVV
          </label>
          <div className="auth-input-wrapper">
            <input
              id="card-cvv"
              className="auth-input"
              type="password"
              inputMode="numeric"
              placeholder="123"
              maxLength={4}
              value={card.cvv}
              disabled={disabled}
              onChange={(e) => update("cvv", e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}