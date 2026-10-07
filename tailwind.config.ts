import type { Config } from "tailwindcss";

/**
 * Receipti design tokens (Phase 01 foundation).
 * Single source of truth for brand color / type / spacing.
 * All values map to CSS variables defined in app/globals.css.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--r-background)",
        card: "var(--r-card)",
        primary: {
          DEFAULT: "var(--r-primary)",
          foreground: "var(--r-on-primary)",
          muted: "var(--r-primary-muted)",
        },
        accent: {
          DEFAULT: "var(--r-accent)",
          foreground: "var(--r-on-accent)",
          muted: "var(--r-accent-muted)",
        },
        ink: {
          DEFAULT: "var(--r-ink)",
          muted: "var(--r-ink-muted)",
          faint: "var(--r-ink-faint)",
        },
        line: "var(--r-line)",
        dark: {
          DEFAULT: "var(--r-dark)",
          raised: "var(--r-dark-raised)",
          line: "var(--r-dark-line)",
        },
        verified: "var(--r-verified)",
        danger: "var(--r-danger)",
        warning: "var(--r-warning)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        display: ["var(--text-display)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        h1: ["var(--text-h1)", { lineHeight: "1.1", letterSpacing: "-0.015em" }],
        h2: ["var(--text-h2)", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        h3: ["var(--text-h3)", { lineHeight: "1.25", letterSpacing: "-0.005em" }],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        pop: "var(--shadow-pop)",
        subtle: "var(--shadow-subtle)",
      },
      borderRadius: {
        xl2: "1rem",
      },
      maxWidth: {
        container: "var(--max-w-container)",
        narrow: "var(--max-w-narrow)",
        wide: "var(--max-w-wide)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 180ms ease-out both",
        "slide-up": "slide-up 220ms ease-out both",
        "scale-in": "scale-in 180ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
