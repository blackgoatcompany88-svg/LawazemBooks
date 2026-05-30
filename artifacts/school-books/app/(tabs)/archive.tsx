import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BookCard } from "@/components/BookCard";
import { GlassCard } from "@/components/GlassCard";
import { BookEntry, GRADES, useBooks } from "@/context/BooksContext";
import { useColors } from "@/hooks/useColors";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface YearGroup {
  year: string;
  books: BookEntry[];
  totalBooks: number;
  totalBalance: number;
  totalNeed: number;
  gradeCount: number;
}

function YearSection({
  group,
  expanded,
  onToggle,
  gradeStudents,
}: {
  group: YearGroup;
  expanded: boolean;
  onToggle: () => void;
  gradeStudents: Record<string, number>;
}) {
  const colors = useColors();

  const byGrade = useMemo(() => {
    const map: Record<string, BookEntry[]> = {};
    group.books.forEach((b) => {
      if (!map[b.grade]) map[b.grade] = [];
      map[b.grade].push(b);
    });
    return GRADES.filter((g) => map[g]?.length > 0).map((g) => ({
      grade: g,
      books: map[g].sort((a, b) => a.number - b.number),
    }));
  }, [group.books]);

  return (
    <View style={styles.yearSection}>
      {/* Year header */}
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.8}
        style={[
          styles.yearHeader,
          {
            backgroundColor: expanded ? colors.glassStrong : colors.glass,
            borderColor: expanded
              ? "rgba(240,160,48,0.4)"
              : colors.glassBorder,
          },
        ]}
      >
        {/* Left: stats */}
        <View style={styles.yearLeft}>
          <View style={styles.statBadge}>
            <Text style={[styles.statValue, { color: colors.primary, fontFamily: "SpaceGrotesk_600SemiBold" }]}>
              {group.totalBalance}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
              متوفر
            </Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={[styles.statValue, { color: group.totalNeed > 0 ? colors.accent : colors.mutedForeground, fontFamily: "SpaceGrotesk_600SemiBold" }]}>
              {group.totalNeed}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
              نقص
            </Text>
          </View>
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.mutedForeground}
            style={{ marginLeft: 6 }}
          />
        </View>

        {/* Right: year + meta */}
        <View style={styles.yearRight}>
          <View style={[styles.yearBadge, { backgroundColor: "rgba(240,160,48,0.15)", borderColor: "rgba(240,160,48,0.35)" }]}>
            <Feather name="archive" size={13} color={colors.accent} />
            <Text style={[styles.yearNum, { color: colors.accent, fontFamily: "SpaceGrotesk_600SemiBold" }]}>
              {group.year}
            </Text>
          </View>
          <Text style={[styles.yearMeta, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
            {group.totalBooks} كتاب · {group.gradeCount} {group.gradeCount === 1 ? "صف" : "صفوف"}
          </Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.gradeList}>
          {byGrade.map(({ grade, books }) => (
            <View key={grade} style={styles.gradeGroup}>
              <View style={[styles.gradeChip, { backgroundColor: "rgba(29,184,142,0.1)", borderColor: "rgba(29,184,142,0.25)" }]}>
                <Text style={[styles.gradeChipText, { color: colors.primary, fontFamily: "NotoKufiArabic_700Bold" }]}>
                  {grade}
                </Text>
              </View>
              <View style={styles.gradeBooks}>
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    gradeStudents={gradeStudents[book.grade] ?? 0}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function ArchiveScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { books, gradeStudents } = useBooks();
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());

  const yearGroups = useMemo<YearGroup[]>(() => {
    const map: Record<string, BookEntry[]> = {};
    books.forEach((b) => {
      const year = new Date(b.createdAt).getFullYear().toString();
      if (!map[year]) map[year] = [];
      map[year].push(b);
    });

    return Object.entries(map)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, yearBooks]) => {
        const grades = new Set(yearBooks.map((b) => b.grade));
        return {
          year,
          books: yearBooks,
          totalBooks: yearBooks.length,
          totalBalance: yearBooks.reduce((s, b) => s + b.schoolBalance, 0),
          totalNeed: yearBooks.reduce((s, b) => s + b.actualNeed, 0),
          gradeCount: grades.size,
        };
      });
  }, [books]);

  const totalAll = useMemo(() => ({
    years: yearGroups.length,
    books: yearGroups.reduce((s, g) => s + g.totalBooks, 0),
  }), [yearGroups]);

  const toggleYear = (year: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedYears((prev) => {
      const next = new Set(prev);
      next.has(year) ? next.delete(year) : next.add(year);
      return next;
    });
  };

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
        <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}>
          الأرشيف
        </Text>

        {/* Summary card */}
        {totalAll.books > 0 && (
          <GlassCard style={styles.summaryCard}>
            <View style={styles.summaryInner}>
              <SummaryItem icon="archive" label="سنوات" value={totalAll.years} color={colors.accent} />
              <View style={[styles.sumDiv, { backgroundColor: colors.border }]} />
              <SummaryItem icon="book" label="كتب مؤرشفة" value={totalAll.books} color={colors.primary} />
            </View>
          </GlassCard>
        )}

        {yearGroups.length === 0 ? (
          <View style={[styles.empty, { borderColor: colors.glassBorder }]}>
            <Feather name="archive" size={48} color={colors.mutedForeground} style={{ opacity: 0.4, marginBottom: 16 }} />
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}>
              الأرشيف فارغ
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
              الكتب التي تُضيفها ستظهر هنا مرتّبةً حسب سنة الإدخال
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/book/new")}
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.85}
            >
              <Feather name="plus" size={16} color="#fff" />
              <Text style={[styles.addBtnText, { fontFamily: "NotoKufiArabic_700Bold" }]}>إضافة كتاب</Text>
            </TouchableOpacity>
          </View>
        ) : (
          yearGroups.map((group) => (
            <YearSection
              key={group.year}
              group={group}
              expanded={expandedYears.has(group.year)}
              onToggle={() => toggleYear(group.year)}
              gradeStudents={gradeStudents}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function SummaryItem({ icon, label, value, color }: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: number;
  color: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.summaryItem}>
      <Feather name={icon} size={18} color={color} style={{ marginBottom: 6 }} />
      <Text style={[styles.summaryValue, { color, fontFamily: "SpaceGrotesk_600SemiBold" }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradient: { position: "absolute", left: 0, right: 0, top: 0 },
  scroll: { paddingHorizontal: 20 },
  pageTitle: { fontSize: 26, textAlign: "right", marginBottom: 16 },

  summaryCard: { marginBottom: 20, overflow: "hidden" },
  summaryInner: { flexDirection: "row", alignItems: "center" },
  summaryItem: { flex: 1, alignItems: "center", paddingVertical: 16 },
  summaryValue: { fontSize: 28 },
  summaryLabel: { fontSize: 11, marginTop: 2 },
  sumDiv: { width: 1, height: 60 },

  yearSection: { marginBottom: 14 },
  yearHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 14, borderRadius: 14, borderWidth: 1,
  },
  yearLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  yearRight: { alignItems: "flex-end", gap: 6 },
  yearBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
  },
  yearNum: { fontSize: 16 },
  yearMeta: { fontSize: 11 },
  statBadge: { alignItems: "center", minWidth: 36 },
  statValue: { fontSize: 16 },
  statLabel: { fontSize: 9, marginTop: 1 },

  gradeList: { marginTop: 8, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: "rgba(240,160,48,0.3)" },
  gradeGroup: { marginBottom: 12 },
  gradeChip: {
    flexDirection: "row", alignItems: "center", alignSelf: "flex-end",
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
    marginBottom: 8,
  },
  gradeChipText: { fontSize: 13 },
  gradeBooks: {},

  empty: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingVertical: 60, paddingHorizontal: 32, borderWidth: 1,
    borderStyle: "dashed", borderRadius: 20, marginTop: 40,
  },
  emptyTitle: { fontSize: 18, marginBottom: 8 },
  emptyDesc: { fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  addBtnText: { color: "#fff", fontSize: 14 },
});
