const letters = [
  { char: "D", color: "#1a1a2e" },
  { char: "e", color: "#1a1a2e" },
  { char: "b", color: "#1a1a2e" },
  { char: "H", color: "#4f46e5" },
  { char: "R", color: "#4f46e5" },
  { char: "M", color: "#4f46e5" },
];

const animationCSS = `
@keyframes letterFadeIn {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes subtlePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}
`;

export default function Loading() {
  return (
    <div
      id="global-loader"
      style={{
        background: "#fff",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <style>{animationCSS}</style>
      <div
        style={{
          display: "flex",
          gap: "2px",
          animation: "subtlePulse 2s ease-in-out infinite",
        }}
      >
        {letters.map((l, i) => (
          <span
            key={i}
            style={{
              fontSize: "48px",
              fontWeight: 800,
              color: l.color,
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "-1px",
              opacity: 0,
              animation: `letterFadeIn 0.5s ease forwards ${i * 0.1}s`,
            }}
          >
            {l.char}
          </span>
        ))}
      </div>
    </div>
  );
}
