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
import { EmptyState } from "@/components/EmptyState";
import { GlassCard } from "@/components/GlassCard";
import { SearchBar } from "@/components/SearchBar";
import { BookEntry, useBooks } from "@/context/BooksContext";
import { useColors } from "@/hooks/useColors";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface GradeGroup {
  grade: string;
  books: BookEntry[];
  totalBooks: number;
  totalStudents: number;
  totalBalance: number;
  totalNeed: number;
  totalReceived: number;
}

function GradeSection({
  group,
  expanded,
  onToggle,
}: {
  group: GradeGroup;
  expanded: boolean;
  onToggle: () => void;
}) {
  const colors = useColors();
  const coverageRatio =
    group.totalStudents > 0
      ? Math.min(1, group.totalBalance / group.totalStudents)
      : 1;
  const barColor =
    coverageRatio >= 1
      ? colors.primary
      : coverageRatio >= 0.5
        ? colors.accent
        : colors.error;

  return (
    <View style={styles.gradeSection}>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.8}
        style={[
          styles.gradeHeader,
          {
            backgroundColor: expanded ? colors.glassStrong : colors.glass,
            borderColor: expanded
              ? "rgba(29,184,142,0.35)"
              : colors.glassBorder,
          },
        ]}
      >
        <View style={styles.gradeHeaderRight}>
          <Text
            style={[
              styles.gradeName,
              { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" },
            ]}
          >
            {group.grade}
          </Text>
          <Text
            style={[
              styles.gradeMeta,
              {
                color: colors.mutedForeground,
                fontFamily: "NotoKufiArabic_400Regular",
              },
            ]}
          >
            {group.totalBooks} {group.totalBooks === 1 ? "كتاب" : "كتب"}
          </Text>
        </View>

        <View style={styles.gradeStats}>
          <StatPill
            value={group.totalBalance}
            label="متوفر"
            color={colors.primary}
          />
          <StatPill
            value={group.totalNeed}
            label="نقص"
            color={
              group.totalNeed > 0 ? colors.accent : colors.mutedForeground
            }
          />
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.mutedForeground}
            style={{ marginLeft: 6 }}
          />
        </View>
      </TouchableOpacity>

      <View
        style={[
          styles.progressBar,
          { backgroundColor: colors.glass, borderColor: colors.glassBorder },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: barColor,
              width: `${Math.round(coverageRatio * 100)}%` as any,
            },
          ]}
        />
        <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
          {`${Math.round(coverageRatio * 100)}% تغطية`}
        </Text>
      </View>

      {expanded && (
        <View style={styles.booksContainer}>
          <View
            style={[
              styles.summaryRow,
              {
                backgroundColor: colors.muted,
                borderColor: colors.glassBorder,
              },
            ]}
          >
            <SummaryCell
              label="إجمالي الطلاب"
              value={group.totalStudents}
              color={colors.foreground}
            />
            <View
              style={[
                styles.summaryDivider,
                { backgroundColor: colors.border },
              ]}
            />
            <SummaryCell
              label="إجمالي الرصيد"
              value={group.totalBalance}
              color={colors.primary}
            />
            <View
              style={[
                styles.summaryDivider,
                { backgroundColor: colors.border },
              ]}
            />
            <SummaryCell
              label="إجمالي النقص"
              value={group.totalNeed}
              color={group.totalNeed > 0 ? colors.accent : colors.primary}
            />
            <View
              style={[
                styles.summaryDivider,
                { backgroundColor: colors.border },
              ]}
            />
            <SummaryCell
              label="المستلم سابقاً"
              value={group.totalReceived}
              color={colors.mutedForeground}
            />
          </View>

          {group.books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}

          <TouchableOpacity
            onPress={() => router.push("/book/new")}
            style={[
              styles.addBookBtn,
              {
                borderColor: "rgba(29,184,142,0.4)",
                backgroundColor: "rgba(29,184,142,0.07)",
              },
            ]}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={16} color="#1DB88E" />
            <Text
              style={[
                styles.addBookLabel,
                { color: "#1DB88E", fontFamily: "NotoKufiArabic_400Regular" },
              ]}
            >
              إضافة كتاب لهذا الصف
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function StatPill({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.pill}>
      <Text
        style={[
          styles.pillValue,
          { color, fontFamily: "SpaceGrotesk_600SemiBold" },
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.pillLabel,
          {
            color: colors.mutedForeground,
            fontFamily: "NotoKufiArabic_400Regular",
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function SummaryCell({
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
    <View style={styles.summaryCell}>
      <Text
        style={[
          styles.summaryCellValue,
          { color, fontFamily: "SpaceGrotesk_600SemiBold" },
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.summaryCellLabel,
          {
            color: colors.mutedForeground,
            fontFamily: "NotoKufiArabic_400Regular",
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { books, schoolInfo } = useBooks();

  const [search, setSearch] = useState("");
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());

  const groups = useMemo<GradeGroup[]>(() => {
    const filtered = search.trim()
      ? books.filter(
          (b) =>
            b.bookName.toLowerCase().includes(search.toLowerCase()) ||
            b.grade.toLowerCase().includes(search.toLowerCase())
        )
      : books;

    const map: Record<string, BookEntry[]> = {};
    filtered.forEach((b) => {
      if (!map[b.grade]) map[b.grade] = [];
      map[b.grade].push(b);
    });

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b, "ar"))
      .map(([grade, gradeBooks]) => ({
        grade,
        books: [...gradeBooks].sort((a, b) => a.number - b.number),
        totalBooks: gradeBooks.length,
        totalStudents: gradeBooks.reduce((s, b) => s + b.studentCount, 0),
        totalBalance: gradeBooks.reduce((s, b) => s + b.schoolBalance, 0),
        totalNeed: gradeBooks.reduce((s, b) => s + b.actualNeed, 0),
        totalReceived: gradeBooks.reduce((s, b) => s + b.receivedLastYear, 0),
      }));
  }, [books, search]);

  const toggleGrade = (grade: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedGrades((prev) => {
      const next = new Set(prev);
      if (next.has(grade)) next.delete(grade);
      else next.add(grade);
      return next;
    });
  };

  const expandAll = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGrades(new Set(groups.map((g) => g.grade)));
  };

  const collapseAll = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGrades(new Set());
  };

  const allExpanded =
    groups.length > 0 && expandedGrades.size === groups.length;

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["rgba(29,184,142,0.15)", "transparent"]}
        style={[styles.gradientTop, { height: topInset + 180 }]}
        pointerEvents="none"
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: topInset + 16,
            paddingBottom:
              Platform.OS === "web" ? 34 : insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/settings")}
            style={[
              styles.iconBtn,
              {
                backgroundColor: colors.glass,
                borderColor: colors.glassBorder,
              },
            ]}
          >
            <Feather name="settings" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text
              style={[
                styles.greeting,
                { color: colors.mutedForeground },
              ]}
            >
              لوحة المتابعة
            </Text>
            <Text
              style={[
                styles.schoolName,
                {
                  color: colors.foreground,
                  fontFamily: "NotoKufiArabic_700Bold",
                },
              ]}
              numberOfLines={1}
            >
              {schoolInfo.schoolName || "مدرستي"}
            </Text>
          </View>
          <View
            style={[
              styles.iconBtn,
              {
                backgroundColor: "rgba(29,184,142,0.15)",
                borderColor: "rgba(29,184,142,0.3)",
              },
            ]}
          >
            <Feather name="book-open" size={20} color={colors.primary} />
          </View>
        </View>

        {schoolInfo.directorate ? (
          <Text
            style={[
              styles.directorate,
              { color: colors.mutedForeground },
            ]}
          >
            {schoolInfo.directorate}
          </Text>
        ) : null}

        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            {groups.length > 0 && (
              <TouchableOpacity
                onPress={allExpanded ? collapseAll : expandAll}
                style={[
                  styles.toggleAllBtn,
                  {
                    backgroundColor: colors.glass,
                    borderColor: colors.glassBorder,
                  },
                ]}
              >
                <Feather
                  name={allExpanded ? "minimize-2" : "maximize-2"}
                  size={13}
                  color={colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.toggleAllText,
                    {
                      color: colors.mutedForeground,
                      fontFamily: "NotoKufiArabic_400Regular",
                    },
                  ]}
                >
                  {allExpanded ? "طيّ الكل" : "فتح الكل"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" },
            ]}
          >
            الصفوف الدراسية
          </Text>
        </View>

        <View style={{ marginBottom: 10 }}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="بحث عن كتاب أو صف..."
          />
        </View>

        {groups.length === 0 ? (
          <EmptyState
            icon="book-open"
            title={search ? "لا توجد نتائج" : "ابدأ بإضافة الكتب"}
            description={
              search
                ? "جرّب البحث بكلمة أخرى"
                : "اذهب إلى تبويب الكتب لإضافة طلبات الكتب المدرسية"
            }
            actionLabel={!search ? "إضافة كتاب" : undefined}
            onAction={
              !search ? () => router.push("/book/new") : undefined
            }
          />
        ) : (
          groups.map((group) => (
            <GradeSection
              key={group.grade}
              group={group}
              expanded={expandedGrades.has(group.grade)}
              onToggle={() => toggleGrade(group.grade)}
            />
          ))
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
  scroll: { paddingHorizontal: 20 },
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
  schoolName: { fontSize: 18, textAlign: "center" },
  directorate: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 8,
  },
  topBarLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 17 },
  toggleAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  toggleAllText: { fontSize: 12 },
  gradeSection: { marginBottom: 14 },
  gradeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  gradeHeaderRight: { flex: 1, alignItems: "flex-end" },
  gradeName: { fontSize: 16 },
  gradeMeta: { fontSize: 12, marginTop: 2 },
  gradeStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginRight: 12,
  },
  pill: { alignItems: "center", minWidth: 38 },
  pillValue: { fontSize: 16 },
  pillLabel: { fontSize: 9, marginTop: 1 },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginHorizontal: 2,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 3,
  },
  progressLabel: {
    position: "absolute",
    right: 6,
    fontSize: 8,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  booksContainer: {
    marginTop: 8,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "rgba(29,184,142,0.3)",
  },
  summaryRow: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },
  summaryDivider: { width: 1 },
  summaryCell: { flex: 1, alignItems: "center", paddingVertical: 10 },
  summaryCellValue: { fontSize: 18 },
  summaryCellLabel: { fontSize: 9, marginTop: 2, textAlign: "center" },
  addBookBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    marginBottom: 4,
    marginTop: 4,
  },
  addBookLabel: { fontSize: 13 },
});
