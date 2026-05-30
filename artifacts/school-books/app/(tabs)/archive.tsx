import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BookCard } from "@/components/BookCard";
import { GlassCard } from "@/components/GlassCard";
import {
  BookEntry,
  GRADES,
  getAcademicYear,
  getSemester,
  useBooks,
} from "@/context/BooksContext";
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
  students: number;
  totalBalance: number;
  totalNeed: number;
}

// ─── Grade section (same look as home) ───────────────────────────────────────
function StudentsEditor({ grade, students }: { grade: string; students: number }) {
  const colors = useColors();
  const { updateGradeStudents } = useBooks();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(students));

  const commit = () => {
    const n = parseInt(val, 10);
    updateGradeStudents(grade, isNaN(n) || n < 0 ? 0 : n);
    setEditing(false);
  };

  if (editing) {
    return (
      <TextInput
        style={[styles.studentsInput, { color: colors.accent, borderColor: colors.accent, fontFamily: "SpaceGrotesk_600SemiBold" }]}
        value={val}
        onChangeText={setVal}
        keyboardType="numeric"
        returnKeyType="done"
        onSubmitEditing={commit}
        onBlur={commit}
        autoFocus
        selectTextOnFocus
      />
    );
  }
  return (
    <TouchableOpacity onPress={() => { setVal(String(students)); setEditing(true); }} style={styles.studentsBtn} hitSlop={8}>
      <Feather name="users" size={12} color={colors.accent} />
      <Text style={[styles.studentsCount, { color: colors.accent, fontFamily: "SpaceGrotesk_600SemiBold" }]}>{students}</Text>
      <Text style={[styles.studentsLabel, { color: colors.accent, fontFamily: "NotoKufiArabic_400Regular" }]}>طالب</Text>
      <Feather name="edit-2" size={10} color={colors.accent} style={{ opacity: 0.6 }} />
    </TouchableOpacity>
  );
}

function GradeSection({ group, expanded, onToggle }: {
  group: GradeGroup; expanded: boolean; onToggle: () => void;
}) {
  const colors = useColors();
  if (group.books.length === 0) return null;

  return (
    <View style={styles.gradeSection}>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.8}
        style={[styles.gradeHeader, {
          backgroundColor: expanded ? colors.glassStrong : colors.glass,
          borderColor: expanded ? "rgba(29,184,142,0.35)" : colors.glassBorder,
        }]}
      >
        <View style={styles.gradeLeft}>
          <StatPill value={group.totalBalance} label="متوفر" color={colors.primary} />
          <StatPill value={group.totalNeed} label="نقص" color={group.totalNeed > 0 ? colors.accent : colors.mutedForeground} />
          <Feather name={expanded ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} style={{ marginLeft: 6 }} />
        </View>
        <View style={styles.gradeRight}>
          <Text style={[styles.gradeName, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}>{group.grade}</Text>
          <View style={styles.gradeSubRow}>
            <StudentsEditor grade={group.grade} students={group.students} />
            <Text style={[styles.gradeMeta, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
              · {group.totalBooks} كتاب
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.booksContainer}>
          {group.books.map((book) => (
            <BookCard key={book.id} book={book} gradeStudents={group.students} />
          ))}
        </View>
      )}
    </View>
  );
}

function StatPill({ value, label, color }: { value: number; label: string; color: string }) {
  const colors = useColors();
  return (
    <View style={styles.pill}>
      <Text style={[styles.pillValue, { color, fontFamily: "SpaceGrotesk_600SemiBold" }]}>{value}</Text>
      <Text style={[styles.pillLabel, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>{label}</Text>
    </View>
  );
}

// ─── Main Archive Screen ──────────────────────────────────────────────────────
export default function ArchiveScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { books, gradeStudents } = useBooks();

  const currentYear = getAcademicYear();
  const currentSem = getSemester();

  const allYears = useMemo(() => {
    const years = new Set<string>();
    books.forEach((b) => years.add(b.academicYear ?? getAcademicYear(new Date(b.createdAt))));
    if (!years.has(currentYear)) years.add(currentYear);
    return [...years].sort((a, b) => b.localeCompare(a));
  }, [books]);

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedSem, setSelectedSem] = useState<1 | 2>(currentSem);
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());

  const groups = useMemo<GradeGroup[]>(() => {
    const filtered = books.filter(
      (b) =>
        (b.academicYear ?? getAcademicYear(new Date(b.createdAt))) === selectedYear &&
        (b.semester ?? getSemester(new Date(b.createdAt))) === selectedSem
    );
    const map: Record<string, BookEntry[]> = {};
    GRADES.forEach((g) => { map[g] = []; });
    filtered.forEach((b) => { if (map[b.grade]) map[b.grade].push(b); });
    return GRADES.map((grade) => {
      const gradeBooks = map[grade].sort((a, b) => a.number - b.number);
      const students = gradeStudents[grade] ?? 0;
      return {
        grade,
        books: gradeBooks,
        totalBooks: gradeBooks.length,
        students,
        totalBalance: gradeBooks.reduce((s, b) => s + b.schoolBalance, 0),
        totalNeed: gradeBooks.reduce((s, b) => s + b.actualNeed, 0),
      };
    });
  }, [books, gradeStudents, selectedYear, selectedSem]);

  const hasBooks = groups.some((g) => g.books.length > 0);
  const totalBooks = groups.reduce((s, g) => s + g.totalBooks, 0);
  const totalNeed = groups.reduce((s, g) => s + g.totalNeed, 0);
  const totalBalance = groups.reduce((s, g) => s + g.totalBalance, 0);

  const toggleGrade = (grade: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedGrades((prev) => {
      const next = new Set(prev);
      next.has(grade) ? next.delete(grade) : next.add(grade);
      return next;
    });
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["rgba(240,160,48,0.10)", "transparent"]}
        style={[styles.gradient, { height: topInset + 220 }]}
        pointerEvents="none"
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topInset + 16, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}>
          الأرشيف
        </Text>

        {/* ── Year selector ── */}
        <Text style={[styles.filterLabel, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
          السنة الدراسية
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearRow}>
          {allYears.map((y) => {
            const active = y === selectedYear;
            return (
              <TouchableOpacity
                key={y}
                onPress={() => { setSelectedYear(y); setExpandedGrades(new Set()); }}
                style={[
                  styles.yearPill,
                  {
                    backgroundColor: active ? colors.accent : colors.glass,
                    borderColor: active ? colors.accent : colors.glassBorder,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Feather name="calendar" size={12} color={active ? "#fff" : colors.mutedForeground} />
                <Text style={[styles.yearPillText, { color: active ? "#fff" : colors.foreground, fontFamily: "SpaceGrotesk_600SemiBold" }]}>
                  {y}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Semester toggle ── */}
        <Text style={[styles.filterLabel, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
          الفصل الدراسي
        </Text>
        <View style={[styles.semRow, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          {([1, 2] as const).map((s) => {
            const active = s === selectedSem;
            return (
              <TouchableOpacity
                key={s}
                onPress={() => { setSelectedSem(s); setExpandedGrades(new Set()); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={[styles.semBtn, { backgroundColor: active ? colors.primary : "transparent" }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.semBtnText, { color: active ? "#fff" : colors.mutedForeground, fontFamily: "NotoKufiArabic_700Bold" }]}>
                  {s === 1 ? "الفصل الأول" : "الفصل الثاني"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Stats strip ── */}
        {hasBooks && (
          <GlassCard style={styles.statsStrip}>
            <StripItem label="كتاب" value={totalBooks} color={colors.foreground} />
            <View style={[styles.stripDiv, { backgroundColor: colors.border }]} />
            <StripItem label="متوفر" value={totalBalance} color={colors.primary} />
            <View style={[styles.stripDiv, { backgroundColor: colors.border }]} />
            <StripItem label="نقص" value={totalNeed} color={totalNeed > 0 ? colors.accent : colors.mutedForeground} />
          </GlassCard>
        )}

        {/* ── Grade sections ── */}
        {!hasBooks ? (
          <View style={[styles.empty, { borderColor: colors.glassBorder }]}>
            <Feather name="archive" size={44} color={colors.mutedForeground} style={{ opacity: 0.35, marginBottom: 14 }} />
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}>
              لا توجد كتب
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
              {`لا يوجد كتب للسنة ${selectedYear} - الفصل ${selectedSem === 1 ? "الأول" : "الثاني"}`}
            </Text>
          </View>
        ) : (
          groups.map((group) =>
            group.books.length === 0 ? null : (
              <GradeSection
                key={group.grade}
                group={group}
                expanded={expandedGrades.has(group.grade)}
                onToggle={() => toggleGrade(group.grade)}
              />
            )
          )
        )}
      </ScrollView>
    </View>
  );
}

function StripItem({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = useColors();
  return (
    <View style={styles.stripItem}>
      <Text style={[styles.stripValue, { color, fontFamily: "SpaceGrotesk_600SemiBold" }]}>{value}</Text>
      <Text style={[styles.stripLabel, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradient: { position: "absolute", left: 0, right: 0, top: 0 },
  scroll: { paddingHorizontal: 20 },
  pageTitle: { fontSize: 26, textAlign: "right", marginBottom: 14 },

  filterLabel: { fontSize: 11, textAlign: "right", marginBottom: 8, marginTop: 4 },
  yearRow: { flexDirection: "row", gap: 8, paddingBottom: 14 },
  yearPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  yearPillText: { fontSize: 14 },

  semRow: { flexDirection: "row", borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 16 },
  semBtn: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 12 },
  semBtnText: { fontSize: 14 },

  statsStrip: { flexDirection: "row", alignItems: "center", marginBottom: 16, overflow: "hidden" },
  stripItem: { flex: 1, alignItems: "center", paddingVertical: 12 },
  stripValue: { fontSize: 22 },
  stripLabel: { fontSize: 10, marginTop: 2 },
  stripDiv: { width: 1, height: 40 },

  gradeSection: { marginBottom: 12 },
  gradeHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 14, borderWidth: 1 },
  gradeLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  gradeRight: { flex: 1, alignItems: "flex-end", paddingRight: 8 },
  gradeName: { fontSize: 15 },
  gradeSubRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  gradeMeta: { fontSize: 11 },
  studentsBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  studentsCount: { fontSize: 13 },
  studentsLabel: { fontSize: 11 },
  studentsInput: { fontSize: 14, borderBottomWidth: 1, minWidth: 40, textAlign: "center", paddingVertical: 0, paddingHorizontal: 4 },
  pill: { alignItems: "center", minWidth: 36 },
  pillValue: { fontSize: 15 },
  pillLabel: { fontSize: 9, marginTop: 1 },
  booksContainer: { marginTop: 8, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: "rgba(29,184,142,0.3)" },

  empty: { alignItems: "center", paddingVertical: 52, borderWidth: 1, borderStyle: "dashed", borderRadius: 18, marginTop: 20 },
  emptyTitle: { fontSize: 17, marginBottom: 8 },
  emptyDesc: { fontSize: 13, textAlign: "center", opacity: 0.7 },
});
