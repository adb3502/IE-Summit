/* Immunoengineering Summit — Tweaks app
   Applies design tweaks to the document via data-attributes + CSS vars. */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "direction": "Lab",
  "accent": "preset",
  "fonts": "Lab",
  "hero": "Cells",
  "cards": "Portrait"
}/*EDITMODE-END*/;

const DIRECTION_MAP = { Lab: "A", Editorial: "B", Ink: "C" };
const FONTS_MAP = { Lab: "lab", Editorial: "editorial", Modern: "modern" };
const HERO_MAP = { Cells: "cells", Mesh: "mesh", Photo: "photo", Plain: "plain" };
const CARDS_MAP = { Portrait: "portrait", Horizontal: "horizontal", Minimal: "minimal" };

const ACCENTS = [
  { id: "preset", label: "Auto", color: null },
  { id: "#178f88", label: "Teal" },
  { id: "#3C124D", label: "Purple" },
  { id: "#4fae63", label: "Green" },
  { id: "#0f5ca0", label: "IISc blue" },
  { id: "#8c2f2a", label: "Maroon" }
];

function darken(hex, amt) {
  const m = hex.replace("#", "");
  const n = parseInt(m.length === 3 ? m.split("").map(c => c + c).join("") : m, 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.round(r * (1 - amt)); g = Math.round(g * (1 - amt)); b = Math.round(b * (1 - amt));
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-direction", DIRECTION_MAP[t.direction] || "A");
    root.setAttribute("data-fonts", FONTS_MAP[t.fonts] || "lab");
    root.setAttribute("data-cards", CARDS_MAP[t.cards] || "portrait");
    const hero = document.getElementById("hero");
    if (hero) hero.setAttribute("data-herostyle", HERO_MAP[t.hero] || "cells");

    if (t.accent && t.accent !== "preset") {
      root.style.setProperty("--accent", t.accent);
      root.style.setProperty("--accent-deep", darken(t.accent, 0.16));
    } else {
      root.style.removeProperty("--accent");
      root.style.removeProperty("--accent-deep");
    }
  }, [t.direction, t.fonts, t.cards, t.hero, t.accent]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Design direction" />
      <TweakRadio
        label="Theme"
        value={t.direction}
        options={["Lab", "Editorial", "Ink"]}
        onChange={(v) => setTweak("direction", v)}
      />
      <TweakRow label="Accent">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {ACCENTS.map((a) => {
            const active = t.accent === a.id;
            return (
              <button
                key={a.id}
                title={a.label}
                onClick={() => setTweak("accent", a.id)}
                style={{
                  width: 24, height: 24, borderRadius: "50%", cursor: "pointer",
                  border: active ? "2px solid #111" : "1px solid rgba(0,0,0,.2)",
                  outline: active ? "2px solid rgba(0,0,0,.15)" : "none",
                  outlineOffset: 1,
                  background: a.color
                    ? a.color
                    : "conic-gradient(from 45deg,#178f88,#3C124D,#4fae63,#0f5ca0,#8c2f2a,#178f88)",
                  padding: 0
                }}
              />
            );
          })}
        </div>
      </TweakRow>

      <TweakSection label="Typography" />
      <TweakRadio
        label="Fonts"
        value={t.fonts}
        options={["Lab", "Editorial", "Modern"]}
        onChange={(v) => setTweak("fonts", v)}
      />

      <TweakSection label="Hero" />
      <TweakRadio
        label="Background"
        value={t.hero}
        options={["Cells", "Mesh", "Photo", "Plain"]}
        onChange={(v) => setTweak("hero", v)}
      />

      <TweakSection label="Speakers" />
      <TweakRadio
        label="Card layout"
        value={t.cards}
        options={["Portrait", "Horizontal", "Minimal"]}
        onChange={(v) => setTweak("cards", v)}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<App />);
