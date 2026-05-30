import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassCard } from "@/components/GlassCard";
import { StatCard } from "@/components/StatCard";
import { useBooks } from "@/context/BooksContext";
import { useColors } from "@/hooks/useColors";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { books, schoolInfo } = useBooks();

  const stats = useMemo(() => {
    const totalBooks = books.length;
    const totalStudents = books.reduce((s, b) => s + b.studentCount, 0);
    const totalNeed = books.reduce((s, b) => s + b.actualNeed, 0);
    const totalBalance = books.reduce((s, b) => s + b.schoolBalance, 0);

    const byGrade: Record<string, { count: number; need: number }> = {};
    books.forEach((b) => {
      if (!byGrade[b.grade]) byGrade[b.grade] = { count: 0, need: 0 };
      byGrade[b.grade].count += 1;
      byGrade[b.grade].need += b.actualNeed;
    });

    return { totalBooks, totalStudents, totalNeed, totalBalance, byGrade };
  }, [books]);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["rgba(29,184,142,0.15)", "transparent"]}
        style={[styles.gradientTop, { height: topInset + 200 }]}
        pointerEvents="none"
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: topInset + 16,
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/settings")}
            style={[styles.iconBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
          >
            <Feather name="settings" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              لوحة المتابعة
            </Text>
            <Text
              style={[styles.schoolName, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}
              numberOfLines={1}
            >
              {schoolInfo.schoolName || "مدرستي"}
            </Text>
          </View>
          <View
            style={[styles.iconBtn, { backgroundColor: "rgba(29,184,142,0.15)", borderColor: "rgba(29,184,142,0.3)" }]}
          >
            <Feather name="book-open" size={20} color={colors.primary} />
          </View>
        </View>

        {schoolInfo.directorate ? (
          <Text style={[styles.directorate, { color: colors.mutedForeground }]}>
            {schoolInfo.directorate}
          </Text>
        ) : null}

        <View style={styles.statsGrid}>
          <StatCard
            label="إجمالي الكتب"
            value={stats.totalBooks}
            color={colors.primary}
            style={styles.statHalf}
          />
          <StatCard
            label="إجمالي الطلاب"
            value={stats.totalStudents}
            color={colors.accent}
            style={styles.statHalf}
          />
          <StatCard
            label="الحاجة الإجمالية"
            value={stats.totalNeed}
            color="#EF4444"
            style={styles.statHalf}
          />
          <StatCard
            label="رصيد المدرسة"
            value={stats.totalBalance}
            color="#60A5FA"
            style={styles.statHalf}
          />
        </View>

        {Object.keys(stats.byGrade).length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}>
              الكتب حسب الصف
            </Text>
            {Object.entries(stats.byGrade).map(([grade, data]) => (
              <GlassCard key={grade} style={styles.gradeRow}>
                <View style={styles.gradeRowInner}>
                  <View style={styles.gradeNeedSide}>
                    <Text style={[styles.gradeNeedValue, { color: colors.warning, fontFamily: "SpaceGrotesk_600SemiBold" }]}>
                      {data.need}
                    </Text>
                    <Text style={[styles.gradeNeedLabel, { color: colors.mutedForeground }]}>
                      حاجة
                    </Text>
                  </View>
                  <View style={[styles.gradeDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.gradeNameSide}>
                    <Text style={[styles.gradeName, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}>
                      {grade}
                    </Text>
                    <Text style={[styles.gradeCount, { color: colors.mutedForeground }]}>
                      {data.count} {data.count === 1 ? "كتاب" : "كتب"}
                    </Text>
                  </View>
                </View>
              </GlassCard>
            ))}
          </>
        )}

        {books.length === 0 && (
          <GlassCard variant="accent" style={styles.emptyCard}>
            <Text style={[styles.emptyTitle, { color: colors.primary, fontFamily: "NotoKufiArabic_700Bold" }]}>
              ابدأ بإضافة الكتب
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
              اذهب إلى تبويب "الكتب" لإضافة طلبات الكتب المدرسية
            </Text>
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradientTop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  headerText: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  greeting: {
    fontSize: 12,
    fontFamily: "NotoKufiArabic_400Regular",
  },
  schoolName: {
    fontSize: 18,
    textAlign: "center",
  },
  directorate: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "NotoKufiArabic_400Regular",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
    marginTop: 16,
  },
  statHalf: {
    flex: 1,
    minWidth: "45%",
  },
  sectionTitle: {
    fontSize: 16,
    textAlign: "right",
    marginBottom: 12,
  },
  gradeRow: {
    marginBottom: 8,
  },
  gradeRowInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  gradeNeedSide: {
    alignItems: "center",
    minWidth: 50,
  },
  gradeNeedValue: {
    fontSize: 20,
  },
  gradeNeedLabel: {
    fontSize: 10,
    fontFamily: "NotoKufiArabic_400Regular",
  },
  gradeDivider: {
    width: 1,
    height: 32,
    marginHorizontal: 14,
  },
  gradeNameSide: {
    flex: 1,
    alignItems: "flex-end",
  },
  gradeName: {
    fontSize: 14,
  },
  gradeCount: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: "NotoKufiArabic_400Regular",
  },
  emptyCard: {
    padding: 24,
    alignItems: "center",
    marginTop: 16,
  },
  emptyTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});
