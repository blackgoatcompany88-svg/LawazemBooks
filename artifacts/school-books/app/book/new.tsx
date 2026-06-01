import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassCard } from "@/components/GlassCard";
import { GRADES, getAcademicYear, getSemester, useBooks } from "@/context/BooksContext";
import { useColors } from "@/hooks/useColors";

export default function NewBookScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { books, gradeStudents, addBook } = useBooks();

  const nextNumber = books.length > 0 ? Math.max(...books.map((b) => b.number)) + 1 : 1;

  const [form, setForm] = useState({
    number: String(nextNumber),
    bookName: "",
    part: "",
    grade: "",
    receivedLastYear: "",
    schoolBalance: "",
    teacherCopies: "",
    academicYear: getAcademicYear(),
    semester: getSemester() as 1 | 2,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gradeOpen, setGradeOpen] = useState(false);

  const students = gradeStudents[form.grade] ?? 0;
  const previewNeed = form.schoolBalance
    ? Math.max(0, students - (Number(form.schoolBalance) || 0))
    : null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.bookName.trim()) e.bookName = "اسم الكتاب مطلوب";
    if (!form.grade) e.grade = "الصف مطلوب";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    addBook({
      number: Number(form.number) || nextNumber,
      bookName: form.bookName.trim(),
      part: form.part.trim(),
      grade: form.grade,
      receivedLastYear: Number(form.receivedLastYear) || 0,
      schoolBalance: Number(form.schoolBalance) || 0,
      teacherCopies: Number(form.teacherCopies) || 0,
      receivedCount: 0,
      deliveredCount: 0,
      academicYear: form.academicYear.trim() || getAcademicYear(),
      semester: form.semester,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.navBar, { paddingTop: topInset + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Feather name="x" size={22} color={colors.mutedForeground} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}>
          إضافة كتاب جديد
        </Text>
        <TouchableOpacity onPress={handleSave} style={[styles.saveChip, { backgroundColor: colors.primary }]}>
          <Text style={[styles.saveChipText, { fontFamily: "NotoKufiArabic_700Bold" }]}>حفظ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <GlassCard style={styles.section}>
          <Field label="الرقم التسلسلي" value={form.number} onChangeText={(t) => setForm({ ...form, number: t })} numeric />
          <Divider />
          <Field
            label="اسم الكتاب *"
            value={form.bookName}
            onChangeText={(t) => { setForm({ ...form, bookName: t }); if (errors.bookName) setErrors({ ...errors, bookName: "" }); }}
            placeholder="مثال: الرياضيات"
            error={errors.bookName}
          />
          <Divider />
          <Field label="الجزء" value={form.part} onChangeText={(t) => setForm({ ...form, part: t })} placeholder="مثال: الأول" />
        </GlassCard>

        {/* Academic Year + Semester */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>السنة الدراسية والفصل</Text>
        <GlassCard style={styles.section}>
          <Field
            label="السنة الدراسية"
            value={form.academicYear}
            onChangeText={(t) => setForm({ ...form, academicYear: t })}
            placeholder="مثال: 2025-2026"
          />
          <Divider />
          <View style={styles.semField}>
            <Text style={[styles.semLabel, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>الفصل الدراسي</Text>
            <View style={[styles.semToggle, { backgroundColor: colors.muted, borderColor: colors.glassBorder }]}>
              {([1, 2] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.semBtn, { backgroundColor: form.semester === s ? colors.primary : "transparent" }]}
                  onPress={() => setForm({ ...form, semester: s })}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.semBtnText, { color: form.semester === s ? "#fff" : colors.mutedForeground, fontFamily: "NotoKufiArabic_700Bold" }]}>
                    {s === 1 ? "الأول" : "الثاني"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </GlassCard>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>الصف الدراسي</Text>
        <GlassCard style={styles.section}>
          <TouchableOpacity onPress={() => setGradeOpen(!gradeOpen)} style={styles.gradeSelector}>
            <Feather name={gradeOpen ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
            <Text style={[styles.gradeValue, { color: form.grade ? colors.foreground : colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
              {form.grade || "اختر الصف"}
            </Text>
            <Text style={[styles.gradeLabel, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>الصف *</Text>
          </TouchableOpacity>
          {errors.grade && <Text style={[styles.error, { color: colors.destructive }]}>{errors.grade}</Text>}
          {gradeOpen && (
            <View style={[styles.gradeList, { borderTopColor: colors.border }]}>
              {GRADES.map((g) => {
                const gs = gradeStudents[g] ?? 0;
                return (
                  <TouchableOpacity
                    key={g}
                    style={[styles.gradeItem, { backgroundColor: form.grade === g ? "rgba(29,184,142,0.12)" : "transparent" }]}
                    onPress={() => { setForm({ ...form, grade: g }); if (errors.grade) setErrors({ ...errors, grade: "" }); setGradeOpen(false); }}
                  >
                    <View style={styles.gradeItemRight}>
                      <Text style={[styles.gradeItemText, { color: form.grade === g ? colors.primary : colors.foreground, fontFamily: "NotoKufiArabic_400Regular" }]}>{g}</Text>
                      {gs > 0 && <Text style={[styles.gradeItemSub, { color: colors.mutedForeground }]}>{gs} طالب</Text>}
                    </View>
                    {form.grade === g && <Feather name="check" size={16} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </GlassCard>

        {form.grade && students > 0 && (
          <View style={[styles.studentsInfo, { backgroundColor: "rgba(29,184,142,0.08)", borderColor: "rgba(29,184,142,0.2)" }]}>
            <Feather name="users" size={14} color={colors.primary} />
            <Text style={[styles.studentsInfoText, { color: colors.primary, fontFamily: "NotoKufiArabic_400Regular" }]}>
              عدد طلاب {form.grade}: {students} طالب
            </Text>
          </View>
        )}

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>الأعداد</Text>
        <GlassCard style={styles.section}>
          <Field label="رصيد المدرسة" value={form.schoolBalance} onChangeText={(t) => setForm({ ...form, schoolBalance: t })} numeric />
          <Divider />
          <Field label="العدد المستلم في العام السابق" value={form.receivedLastYear} onChangeText={(t) => setForm({ ...form, receivedLastYear: t })} numeric />
          <Divider />
          <Field label="نسخ المعلم" value={form.teacherCopies} onChangeText={(t) => setForm({ ...form, teacherCopies: t })} numeric />
        </GlassCard>

        {previewNeed !== null && students > 0 && (
          <GlassCard variant="accent" style={styles.needPreview}>
            <Text style={[styles.needLabel, { color: colors.primary, fontFamily: "NotoKufiArabic_400Regular" }]}>الحاجة الفعلية المحسوبة</Text>
            <Text style={[styles.needValue, { color: previewNeed > 0 ? colors.accent : colors.primary, fontFamily: "SpaceGrotesk_600SemiBold" }]}>
              {previewNeed}
            </Text>
            <Text style={[styles.needFormula, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
              {students} طالب − {Number(form.schoolBalance) || 0} رصيد = {previewNeed}
            </Text>
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder, numeric, error }: {
  label: string; value: string; onChangeText: (t: string) => void;
  placeholder?: string; numeric?: boolean; error?: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, { color: colors.foreground, borderColor: error ? colors.destructive : "transparent", fontFamily: numeric ? "SpaceGrotesk_400Regular" : "NotoKufiArabic_400Regular" }]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={numeric ? "numeric" : "default"}
        textAlign="right"
        placeholder={placeholder ?? (numeric ? "0" : "")}
        placeholderTextColor={colors.mutedForeground}
      />
      {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
    </View>
  );
}

function Divider() {
  const colors = useColors();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  navBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  navTitle: { fontSize: 17 },
  saveChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  saveChipText: { color: "#fff", fontSize: 14 },
  scroll: { padding: 20 },
  sectionLabel: { fontSize: 12, textAlign: "right", marginBottom: 8, marginTop: 16, fontFamily: "NotoKufiArabic_400Regular" },
  section: { overflow: "hidden" },
  field: { padding: 14 },
  fieldLabel: { fontSize: 11, textAlign: "right", marginBottom: 6 },
  fieldInput: { fontSize: 16, paddingVertical: 2, borderBottomWidth: 1 },
  error: { fontSize: 11, textAlign: "right", marginTop: 4 },
  divider: { height: 1, marginHorizontal: 14 },
  semField: { padding: 14 },
  semLabel: { fontSize: 11, textAlign: "right", marginBottom: 10 },
  semToggle: { flexDirection: "row", borderRadius: 10, borderWidth: 1, overflow: "hidden" },
  semBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 8 },
  semBtnText: { fontSize: 13 },
  gradeSelector: { flexDirection: "row", alignItems: "center", padding: 14, gap: 8 },
  gradeValue: { flex: 1, fontSize: 15, textAlign: "right" },
  gradeLabel: { fontSize: 11 },
  gradeList: { borderTopWidth: 1 },
  gradeItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  gradeItemRight: { flex: 1, alignItems: "flex-end" },
  gradeItemText: { fontSize: 14 },
  gradeItemSub: { fontSize: 11, marginTop: 2, fontFamily: "SpaceGrotesk_400Regular" },
  studentsInfo: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginTop: 10 },
  studentsInfoText: { flex: 1, fontSize: 13, textAlign: "right" },
  needPreview: { padding: 20, alignItems: "center", marginTop: 16 },
  needLabel: { fontSize: 13, marginBottom: 4 },
  needValue: { fontSize: 44, lineHeight: 52 },
  needFormula: { fontSize: 12, marginTop: 4 },
});
