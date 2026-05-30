import React from "react";
import {
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "strong" | "accent";
}

export function GlassCard({
  children,
  style,
  variant = "default",
}: GlassCardProps) {
  const colors = useColors();

  const bg =
    variant === "strong"
      ? colors.glassStrong
      : variant === "accent"
        ? "rgba(29,184,142,0.12)"
        : colors.glass;

  const border =
    variant === "accent"
      ? "rgba(29,184,142,0.30)"
      : colors.glassBorder;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bg,
          borderColor: border,
          borderRadius: colors.radius,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
});
