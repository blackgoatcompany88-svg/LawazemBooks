const colors = {
  dark: {
    text: "#E8EDF5",
    tint: "#1DB88E",

    background: "#181C24",
    foreground: "#E8EDF5",

    card: "rgba(255,255,255,0.06)",
    cardForeground: "#E8EDF5",

    primary: "#1DB88E",
    primaryForeground: "#ffffff",

    secondary: "rgba(255,255,255,0.08)",
    secondaryForeground: "#B0B8CC",

    muted: "rgba(255,255,255,0.05)",
    mutedForeground: "#7A849A",

    accent: "#F0A030",
    accentForeground: "#181C24",

    destructive: "#EF4444",
    destructiveForeground: "#ffffff",

    border: "rgba(255,255,255,0.10)",
    input: "rgba(255,255,255,0.08)",

    glass: "rgba(255,255,255,0.06)",
    glassBorder: "rgba(255,255,255,0.12)",
    glassStrong: "rgba(255,255,255,0.10)",

    surface1: "#1E2330",
    surface2: "#242A38",
    surface3: "#2A3040",

    success: "#1DB88E",
    warning: "#F0A030",
    error: "#EF4444",
    info: "#60A5FA",
  },

  radius: 16,
};

export type ColorScheme = typeof colors.dark;
export default colors;
