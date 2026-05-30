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
import { Circle, Svg, Text as SvgText } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { GlassCard } from "@/components/GlassCard";
import { BookEntry, GRADES, useBooks } from "@/context/BooksContext";
import { useColors } from "@/hooks/useColors";

interface GradeStats {
  grade: string;
  books: BookEntry[];
  totalBooks: number;
  totalStudents: number;
  totalBalance: number;
  totalNeed: number;
}

function DonutChart({
  available,
  need,
  size = 110,
  strokeWidth = 14,
}: {
  available: number;
  need: number;
  size?: number;
  strokeWidth?: number;
}) {
  const colors = useColors();
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = available + need;
  const startOffset = circumference * 0.25; // rotate to start at top

  const availDash = total > 0 ? (available / total) * circumference : 0;
  const needDash = total > 0 ? (need / total) * circumference : 0;

  const coveragePct =
    total > 0 ? Math.round((available / total) * 100) : 0;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        {/* track */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {total > 0 ? (
          <>
            {/* available (green) */}
            <Circle
              cx={cx}
              cy={cy}
              r={r}
              stroke="#1DB88E"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${availDash} ${circumference}`}
              strokeDashoffset={startOffset}
              strokeLinecap="round"
            />
            {/* need (gold) */}
            {needDash > 1 && (
              <Circle
                cx={cx}
                cy={cy}
                r={r}
                stroke="#F0A030"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${needDash} ${circumference}`}
                strokeDashoffset={startOffset - availDash}
                strokeLinecap="round"
              />
            )}
          </>
        ) : (
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference * 0.98} ${circumference * 0.02}`}
            strokeDashoffset={startOffset}
          />
        )}
        <SvgText
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fill={total > 0 ? "#1DB88E" : "rgba(255,255,255,0.3)"}
          fontSize="18"
          fontFamily="SpaceGrotesk_600SemiBold"
          fontWeight="bold"
        >
          {coveragePct}%
        </SvgText>
        <SvgText
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fill="rgba(255,255,255,0.45)"
          fontSize="9"
          fontFamily="NotoKufiArabic_400Regular"
        >
          تغطية
        </SvgText>
      </Svg>
    </View>
  );
}

function GradeStatCard({ stat }: { stat: GradeStats }) {
  const colors = useColors();
  const coveragePct =
    stat.totalStudents > 0
      ? Math.round((stat.totalBalance / stat.totalStudents) * 100)
      : 0;

  const statusColor =
    coveragePct >= 100
      ? colors.primary
      : coveragePct >= 50
        ? colors.accent
        : colors.error;

  return (
    <GlassCard style={styles.gradeCard}>
      <View style={styles.gradeCardInner}>
        {/* Donut chart */}
        <DonutChart available={stat.totalBalance} need={stat.totalNeed} />

        {/* Info */}
        <View style={styles.gradeInfo}>
          <Text
            style={[styles.gradeName, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}
            numberOfLines={2}
          >
            {stat.grade}
          </Text>
          <Text style={[styles.gradeBooks, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
            {stat.totalBooks} {stat.totalBooks === 1 ? "كتاب" : "كتب"}
          </Text>

          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: "rgba(29,184,142,0.15)", borderColor: "rgba(29,184,142,0.3)" }]}>
              <Text style={[styles.badgeValue, { color: colors.primary, fontFamily: "SpaceGrotesk_600SemiBold" }]}>
                {stat.totalBalance}
              </Text>
              <Text style={[styles.badgeLabel, { color: colors.primary, fontFamily: "NotoKufiArabic_400Regular" }]}>
                متوفر
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: stat.totalNeed > 0 ? "rgba(240,160,48,0.15)" : "rgba(255,255,255,0.05)", borderColor: stat.totalNeed > 0 ? "rgba(240,160,48,0.3)" : colors.glassBorder }]}>
              <Text style={[styles.badgeValue, { color: stat.totalNeed > 0 ? colors.accent : colors.mutedForeground, fontFamily: "SpaceGrotesk_600SemiBold" }]}>
                {stat.totalNeed}
              </Text>
              <Text style={[styles.badgeLabel, { color: stat.totalNeed > 0 ? colors.accent : colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
                نقص
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Students bar */}
      <View style={[styles.studentsRow, { borderTopColor: colors.border }]}>
        <View style={[styles.progressTrack, { backgroundColor: "rgba(255,255,255,0.06)" }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: statusColor,
                width: `${Math.min(100, coveragePct)}%` as any,
              },
            ]}
          />
        </View>
        <Text style={[styles.studentsLabel, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
          {stat.totalStudents > 0 ? `${stat.totalStudents} طالب` : "لا يوجد بيانات"}
        </Text>
      </View>
    </GlassCard>
  );
}

export default function StatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { books, schoolInfo } = useBooks();

  const gradeStats = useMemo<GradeStats[]>(() => {
    const map: Record<string, BookEntry[]> = {};
    GRADES.forEach((g) => { map[g] = []; });
    books.forEach((b) => {
      if (!map[b.grade]) map[b.grade] = [];
      map[b.grade].push(b);
    });
    return GRADES.map((grade) => {
      const gradeBooks = map[grade] ?? [];
      return {
        grade,
        books: gradeBooks,
        totalBooks: gradeBooks.length,
        totalStudents: gradeBooks.reduce((s, b) => s + b.studentCount, 0),
        totalBalance: gradeBooks.reduce((s, b) => s + b.schoolBalance, 0),
        totalNeed: gradeBooks.reduce((s, b) => s + b.actualNeed, 0),
      };
    });
  }, [books]);

  const overall = useMemo(() => {
    const totalStudents = gradeStats.reduce((s, g) => s + g.totalStudents, 0);
    const totalBalance = gradeStats.reduce((s, g) => s + g.totalBalance, 0);
    const totalNeed = gradeStats.reduce((s, g) => s + g.totalNeed, 0);
    const totalBooks = books.length;
    const coveragePct =
      totalStudents > 0 ? Math.round((totalBalance / totalStudents) * 100) : 0;
    return { totalStudents, totalBalance, totalNeed, totalBooks, coveragePct };
  }, [gradeStats, books]);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["rgba(240,160,48,0.12)", "transparent"]}
        style={[styles.gradient, { height: topInset + 200 }]}
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
        {/* Header */}
        <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}>
          إحصائية
        </Text>
        {schoolInfo.schoolName ? (
          <Text style={[styles.schoolSub, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
            {schoolInfo.schoolName}
          </Text>
        ) : null}

        {/* Overall donut */}
        <GlassCard variant="accent" style={styles.overallCard}>
          <View style={styles.overallInner}>
            <DonutChart
              available={overall.totalBalance}
              need={overall.totalNeed}
              size={130}
              strokeWidth={16}
            />
            <View style={styles.overallInfo}>
              <Text style={[styles.overallTitle, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}>
                الإجمالي الكلي
              </Text>
              <View style={styles.overallStats}>
                <OverallStat label="إجمالي الكتب" value={overall.totalBooks} color={colors.foreground} />
                <OverallStat label="متوفر" value={overall.totalBalance} color={colors.primary} />
                <OverallStat label="نقص" value={overall.totalNeed} color={overall.totalNeed > 0 ? colors.accent : colors.mutedForeground} />
              </View>
            </View>
          </View>

          {/* Legend */}
          <View style={[styles.legend, { borderTopColor: colors.border }]}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#F0A030" }]} />
              <Text style={[styles.legendText, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
                نقص الكتب
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#1DB88E" }]} />
              <Text style={[styles.legendText, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
                كتب متوفرة
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Grade cards */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}>
          تفصيل حسب الصف
        </Text>

        <View style={styles.grid}>
          {gradeStats.map((stat) => (
            <View key={stat.grade} style={styles.gridItem}>
              <GradeStatCard stat={stat} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function OverallStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.overallStat}>
      <Text style={[styles.overallStatValue, { color, fontFamily: "SpaceGrotesk_600SemiBold" }]}>
        {value}
      </Text>
      <Text style={[styles.overallStatLabel, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradient: { position: "absolute", left: 0, right: 0, top: 0 },
  scroll: { paddingHorizontal: 16 },
  pageTitle: { fontSize: 26, textAlign: "right", marginBottom: 2 },
  schoolSub: { fontSize: 12, textAlign: "right", marginBottom: 16 },

  overallCard: { padding: 0, overflow: "hidden", marginBottom: 24 },
  overallInner: { flexDirection: "row", alignItems: "center", padding: 16, gap: 16 },
  overallInfo: { flex: 1, alignItems: "flex-end" },
  overallTitle: { fontSize: 16, marginBottom: 12 },
  overallStats: { gap: 8, alignItems: "flex-end" },
  overallStat: { alignItems: "flex-end" },
  overallStatValue: { fontSize: 22 },
  overallStatLabel: { fontSize: 11 },

  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12 },

  sectionTitle: { fontSize: 17, textAlign: "right", marginBottom: 12 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItem: { width: "47.5%" },

  gradeCard: { padding: 0, overflow: "hidden" },
  gradeCardInner: { alignItems: "center", padding: 12, gap: 10 },
  gradeInfo: { width: "100%", alignItems: "flex-end" },
  gradeName: { fontSize: 13, textAlign: "right", marginBottom: 2 },
  gradeBooks: { fontSize: 11, marginBottom: 10 },
  badges: { flexDirection: "row", gap: 6 },
  badge: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeValue: { fontSize: 16 },
  badgeLabel: { fontSize: 9, marginTop: 1 },

  studentsRow: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 6,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  studentsLabel: { fontSize: 10, textAlign: "right" },
});
