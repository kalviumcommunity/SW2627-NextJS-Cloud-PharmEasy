// Clear, large, unambiguous pill/capsule/strip illustrations — one look per
// medicine, sized big enough that a user immediately reads it as "this is a
// tablet / this is a capsule / this is a strip", not an abstract shape.

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const PALETTES = {
  diabetes: [["#0e7a63", "#eaf6f1"], ["#1a8f74", "#ffffff"]],
  hypertension: [["#c17a2d", "#fff3e6"], ["#b5471b", "#ffffff"]],
  thyroid: [["#6d4aa3", "#f1ecf9"], ["#8760c2", "#ffffff"]],
  cardiac: [["#b0223f", "#fdeef0"], ["#d13a55", "#ffffff"]],
  supplements: [["#b8860b", "#fff8e6"], ["#d9a520", "#ffffff"]],
};
const DEFAULT_PALETTE = [["#10604e", "#eaf3f1"]];

function Capsule({ capColor, bodyColor }) {
  return (
    <svg viewBox="0 0 160 70" width="100%" height="100%">
      <defs>
        <clipPath id="capsuleClip">
          <rect x="3" y="3" width="154" height="64" rx="32" />
        </clipPath>
      </defs>
      <g clipPath="url(#capsuleClip)">
        <rect x="3" y="3" width="77" height="64" fill={capColor} />
        <rect x="80" y="3" width="77" height="64" fill={bodyColor} />
      </g>
      <rect x="3" y="3" width="154" height="64" rx="32" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="2" />
      <ellipse cx="40" cy="18" rx="20" ry="8" fill="#ffffff" opacity="0.25" />
    </svg>
  );
}

function RoundTablet({ capColor, bodyColor }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <circle cx="50" cy="50" r="47" fill={bodyColor} stroke="rgba(0,0,0,0.12)" strokeWidth="2" />
      <circle cx="50" cy="50" r="47" fill="none" stroke={capColor} strokeWidth="4" opacity="0.4" />
      <line x1="12" y1="50" x2="88" y2="50" stroke={capColor} strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      <ellipse cx="34" cy="28" rx="18" ry="9" fill="#ffffff" opacity="0.3" />
    </svg>
  );
}

function OvalTablet({ capColor, bodyColor }) {
  return (
    <svg viewBox="0 0 150 90" width="100%" height="100%">
      <ellipse cx="75" cy="45" rx="70" ry="38" fill={bodyColor} stroke="rgba(0,0,0,0.12)" strokeWidth="2" />
      <line x1="75" y1="12" x2="75" y2="78" stroke={capColor} strokeWidth="4" strokeLinecap="round" opacity="0.55" />
      <ellipse cx="48" cy="24" rx="20" ry="9" fill="#ffffff" opacity="0.3" />
    </svg>
  );
}

function BlisterStrip({ capColor, bodyColor }) {
  return (
    <svg viewBox="0 0 170 70" width="100%" height="100%">
      <rect x="2" y="2" width="166" height="66" rx="10" fill={bodyColor} stroke="rgba(0,0,0,0.12)" strokeWidth="2" />
      <line x1="2" y1="35" x2="168" y2="35" stroke={capColor} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
      {[25, 60, 95, 130, 155].map((cx, i) => (
        <circle key={i} cx={cx} cy={35} r={i === 4 ? 8 : 14} fill={capColor} opacity={i === 4 ? 0.35 : 0.9} />
      ))}
    </svg>
  );
}

const SHAPES = [Capsule, RoundTablet, OvalTablet, BlisterStrip];

export default function MedicineVisual({ category, name = "", imageUrl, size = "100%" }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }

  const key = category?.toLowerCase();
  const palettes = PALETTES[key] || DEFAULT_PALETTE;

  const hash = hashString(name || category || "medicine");
  const Shape = SHAPES[hash % SHAPES.length];
  const [capColor, bodyColor] = palettes[Math.floor(hash / SHAPES.length) % palettes.length];

  const isTablet = Shape === RoundTablet;
  const isStrip = Shape === BlisterStrip;
  const rotation = isTablet || isStrip ? 0 : -8 + (hash % 5) * 4;
  const scale = 0.95 + ((hash >> 3) % 3) * 0.06;

  let boxWidth = "130px";
  let boxHeight = "80px";
  if (isTablet) {
    boxWidth = "104px";
    boxHeight = "104px";
  } else if (isStrip) {
    boxWidth = "150px";
    boxHeight = "62px";
  }

  return (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: boxWidth,
          height: boxHeight,
          transform: `rotate(${rotation}deg) scale(${scale})`,
          filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.14))",
        }}
      >
        <Shape capColor={capColor} bodyColor={bodyColor} />
      </div>
    </div>
  );
}