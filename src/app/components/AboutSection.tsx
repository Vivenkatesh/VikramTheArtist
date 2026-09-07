function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="about-badge"
      style={{
        display: "inline-block",
        padding: "2px 16px 4px",
        margin: "3px 2px",
        borderRadius: "9999px",
        whiteSpace: "nowrap",
        fontFamily: "'DM Serif Display', serif",
        fontStyle: "normal",
        fontWeight: 400,
        fontSize: "inherit",
        letterSpacing: "0.01em",
        verticalAlign: "middle",
        lineHeight: 1.6,
      }}
    >
      {children}
    </span>
  );
}

const proseStyle: React.CSSProperties = {
  fontFamily: "'Satoshi', sans-serif",
  fontWeight: 400,
  fontSize: "clamp(1.02rem, 1.28vw, 1.32rem)",
  letterSpacing: "-0.3px",
  lineHeight: 2.3,
  color: "var(--text-2)",
  textAlign: "center",
  margin: 0,
};

export function AboutSection() {
  return (
    <section
      id="about"
      className="about-section"
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "clamp(60px, 8vw, 90px) 16px",
        position: "relative",
      }}
    >
      <div
        className="about-glass-panel"
        style={{
          maxWidth: "940px",
          margin: "0 auto",
          position: "relative",
        }}
      >
        <p style={proseStyle}>
          <Badge>User Experience designer</Badge>{" "}
          at Microsoft, driven to empower tomorrow{" "}
          through innovative designs solutions with over{" "}
          <Badge>18 years</Badge>{" "}
          of industry experience.{" "}
          Committed to creating{" "}
          <Badge>intuitive and user-friendly</Badge>{" "}
          digital experiences that solve real-world problems and make a{" "}
          <Badge>positive difference</Badge>{" "}
          in people&apos;s lives. I am currently based out of{" "}
          <span
            style={{
              textDecoration: "line-through",
              color: "var(--text-3)",
            }}
          >
            Chennai, Amsterdam, Copenhagen, Prague, Warsaw, New York City
          </span>
          , back in India
        </p>
      </div>
    </section>
  );
}
