import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const PIN_LENGTH = 4;

interface PinLockProps {
  title?: string;
  subtitle?: string;
  onComplete: (pin: string) => void;
  onCancel?: () => void;
  error?: boolean;
  showCancel?: boolean;
}

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "del"],
];

export function PinLock({
  title = "أدخل كلمة السر",
  subtitle,
  onComplete,
  onCancel,
  error = false,
  showCancel = false,
}: PinLockProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState("");
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const dotAnims = useRef(
    Array.from({ length: PIN_LENGTH }, () => new Animated.Value(0))
  ).current;

  const shake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start(() => setPin(""));
  };

  useEffect(() => {
    if (error) shake();
  }, [error]);

  useEffect(() => {
    if (pin.length > 0) {
      const idx = pin.length - 1;
      Animated.sequence([
        Animated.timing(dotAnims[idx], { toValue: 1.3, duration: 80, useNativeDriver: true }),
        Animated.timing(dotAnims[idx], { toValue: 1, duration: 80, useNativeDriver: true }),
      ]).start();
    }
  }, [pin]);

  const pressKey = (key: string) => {
    if (key === "del") {
      setPin((p) => p.slice(0, -1));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    if (key === "" || pin.length >= PIN_LENGTH) return;
    const newPin = pin + key;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPin(newPin);
    if (newPin.length === PIN_LENGTH) {
      setTimeout(() => onComplete(newPin), 150);
    }
  };

  const topPad = Platform.OS === "web" ? 80 : insets.top + 40;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["rgba(29,184,142,0.18)", "transparent"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Logo */}
      <View style={[styles.logo, { marginTop: topPad }]}>
        <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
          <Text style={[styles.logoText, { fontFamily: "NotoKufiArabic_700Bold" }]}>اللوازم</Text>
        </View>
        <Text style={[styles.appName, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}>
          اللوازم المدرسية
        </Text>
      </View>

      {/* Title */}
      <View style={styles.titleArea}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* PIN dots */}
      <Animated.View style={[styles.dots, { transform: [{ translateX: shakeAnim }] }]}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => {
          const filled = i < pin.length;
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: filled ? colors.primary : "transparent",
                  borderColor: filled ? colors.primary : colors.mutedForeground,
                  transform: [{ scale: dotAnims[i] }],
                },
              ]}
            />
          );
        })}
      </Animated.View>

      {/* Numpad */}
      <View style={styles.numpad}>
        {KEYS.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((key, ki) => {
              if (key === "") return <View key={ki} style={styles.keyEmpty} />;
              if (key === "del") {
                return (
                  <TouchableOpacity
                    key={ki}
                    style={[styles.key, { backgroundColor: "rgba(255,255,255,0.06)" }]}
                    onPress={() => pressKey("del")}
                    activeOpacity={0.7}
                  >
                    <Feather name="delete" size={22} color={colors.mutedForeground} />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={ki}
                  style={[styles.key, { backgroundColor: "rgba(255,255,255,0.06)", borderColor: colors.glassBorder, borderWidth: 1 }]}
                  onPress={() => pressKey(key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.keyText, { color: colors.foreground, fontFamily: "SpaceGrotesk_600SemiBold" }]}>
                    {key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {showCancel && onCancel && (
        <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
          <Text style={[styles.cancelText, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
            إلغاء
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center" },
  logo: { alignItems: "center", marginBottom: 32 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  logoText: { color: "#fff", fontSize: 16 },
  appName: { fontSize: 16 },
  titleArea: { alignItems: "center", marginBottom: 32 },
  title: { fontSize: 20, marginBottom: 6 },
  subtitle: { fontSize: 13 },
  dots: { flexDirection: "row", gap: 18, marginBottom: 48 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
  numpad: { gap: 14, width: "80%", maxWidth: 300 },
  row: { flexDirection: "row", gap: 14 },
  key: { flex: 1, height: 68, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  keyEmpty: { flex: 1, height: 68 },
  keyText: { fontSize: 26 },
  cancelBtn: { marginTop: 28, padding: 12 },
  cancelText: { fontSize: 15 },
});
