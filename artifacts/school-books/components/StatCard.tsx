import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { GlassCard } from "@/components/GlassCard";
import { useColors } from "@/hooks/useColors";

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  style?: ViewStyle;
}

export function StatCard({ label, value, color, style }: StatCardProps) {
  const colors = useColors();
  const accent = color ?? colors.primary;

  return (
    <GlassCard style={[styles.card, style]}>
      <View style={[styles.bar, { backgroundColor: accent }]} />
      <View style={styles.content}>
        <Text style={[styles.value, { color: accent, fontFamily: "SpaceGrotesk_600SemiBold" }]}>
          {value}
        </Text>
        <Text
          style={[styles.label, { color: colors.mutedForeground }]}
          numberOfLines={2}
        >
          {label}
        </Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "stretch",
    overflow: "hidden",
  },
  bar: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
    alignSelf: "stretch",
  },
  content: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 14,
    alignItems: "flex-end",
  },
  value: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
    textAlign: "right",
    fontFamily: "NotoKufiArabic_400Regular",
  },
});
