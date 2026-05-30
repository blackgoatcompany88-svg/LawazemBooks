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
import { GRADES, useBooks } from "@/context/BooksContext";
import { useColors } from "@/hooks/useColors";

export default function NewBookScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { books, addBook } = useBooks();

  const nextNumber = books.length > 0 ? Math.max(...books.map((b) => b.number)) + 1 : 1;

  const [form, setForm] = useState({
    number: String(nextNumber),
    bookName: "",
    part: "",
    grade: "",
    studentCount: "",
    receivedLastYear: "",
    schoolBalance: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gradeOpen, setGradeOpen] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.bookName.trim()) e.bookName = "اسم الكتاب مطلوب";
    if (!form.grade) e.grade = "الصف مطلوب";
    if (!form.studentCount || isNaN(Number(form.studentCount)))
      e.studentCount = "أدخل عدداً صحيحاً";
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
      studentCount: Number(form.studentCount) || 0,
      receivedLastYear: Number(form.receivedLastYear) || 0,
      schoolBalance: Number(form.schoolBalance) || 0,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.navBar,
          {
            paddingTop: topInset + 8,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Feather name="x" size={22} color={colors.mutedForeground} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}>
          إضافة كتاب جديد
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveChip, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.saveChipText, { fontFamily: "NotoKufiArabic_700Bold" }]}>
            حفظ
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <GlassCard style={styles.section}>
          <NumInput
            label="الرقم التسلسلي"
            value={form.number}
            onChangeText={(t) => setForm({ ...form, number: t })}
          />
          <Divider />
          <TextFieldInput
            label="اسم الكتاب *"
            value={form.bookName}
            onChangeText={(t) => {
              setForm({ ...form, bookName: t });
              if (errors.bookName) setErrors({ ...errors, bookName: "" });
            }}
            placeholder="مثال: الرياضيات"
            error={errors.bookName}
          />
          <Divider />
          <TextFieldInput
            label="الجزء"
            value={form.part}
            onChangeText={(t) => setForm({ ...form, part: t })}
            placeholder="مثال: الأول"
          />
        </GlassCard>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          الصف الدراسي
        </Text>

        <GlassCard style={styles.section}>
          <TouchableOpacity
            onPress={() => setGradeOpen(!gradeOpen)}
            style={styles.gradeSelector}
          >
            <Feather
              name={gradeOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.mutedForeground}
            />
            <Text
              style={[
                styles.gradeValue,
                {
                  color: form.grade ? colors.foreground : colors.mutedForeground,
                  fontFamily: "NotoKufiArabic_400Regular",
                },
              ]}
            >
              {form.grade || "اختر الصف"}
            </Text>
            <Text style={[styles.gradeLabel, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
              الصف *
            </Text>
          </TouchableOpacity>
          {errors.grade && (
            <Text style={[styles.error, { color: colors.destructive }]}>{errors.grade}</Text>
          )}
          {gradeOpen && (
            <View style={[styles.gradeList, { borderTopColor: colors.border }]}>
              {GRADES.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.gradeItem,
                    {
                      backgroundColor:
                        form.grade === g ? "rgba(29,184,142,0.12)" : "transparent",
                    },
                  ]}
                  onPress={() => {
                    setForm({ ...form, grade: g });
                    if (errors.grade) setErrors({ ...errors, grade: "" });
                    setGradeOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.gradeItemText,
                      {
                        color: form.grade === g ? colors.primary : colors.foreground,
                        fontFamily: "NotoKufiArabic_400Regular",
                      },
                    ]}
                  >
                    {g}
                  </Text>
                  {form.grade === g && (
                    <Feather name="check" size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </GlassCard>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          الأعداد
        </Text>

        <GlassCard style={styles.section}>
          <NumInput
            label="عدد الطلاب *"
            value={form.studentCount}
            onChangeText={(t) => {
              setForm({ ...form, studentCount: t });
              if (errors.studentCount) setErrors({ ...errors, studentCount: "" });
            }}
            error={errors.studentCount}
          />
          <Divider />
          <NumInput
            label="العدد المستلم في العام السابق"
            value={form.receivedLastYear}
            onChangeText={(t) => setForm({ ...form, receivedLastYear: t })}
          />
          <Divider />
          <NumInput
            label="رصيد المدرسة"
            value={form.schoolBalance}
            onChangeText={(t) => setForm({ ...form, schoolBalance: t })}
          />
        </GlassCard>

        {form.studentCount && form.schoolBalance && (
          <GlassCard variant="accent" style={styles.needPreview}>
            <Text style={[styles.needLabel, { color: colors.primary, fontFamily: "NotoKufiArabic_400Regular" }]}>
              الحاجة الفعلية المحسوبة
            </Text>
            <Text style={[styles.needValue, { color: colors.primary, fontFamily: "SpaceGrotesk_600SemiBold" }]}>
              {Math.max(0, (Number(form.studentCount) || 0) - (Number(form.schoolBalance) || 0))}
            </Text>
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
}

function TextFieldInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  error?: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
        {label}
      </Text>
      <TextInput
        style={[styles.fieldInput, { color: colors.foreground, borderColor: error ? colors.destructive : "transparent", fontFamily: "NotoKufiArabic_400Regular" }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        textAlign="right"
      />
      {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
    </View>
  );
}

function NumInput({
  label,
  value,
  onChangeText,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
        {label}
      </Text>
      <TextInput
        style={[styles.fieldInput, { color: colors.foreground, borderColor: error ? colors.destructive : "transparent", fontFamily: "SpaceGrotesk_400Regular" }]}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        textAlign="right"
        placeholder="0"
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
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  navTitle: { fontSize: 17 },
  saveChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveChipText: { color: "#fff", fontSize: 14 },
  scroll: { padding: 20 },
  sectionLabel: {
    fontSize: 12,
    textAlign: "right",
    marginBottom: 8,
    marginTop: 16,
    fontFamily: "NotoKufiArabic_400Regular",
  },
  section: { overflow: "hidden" },
  field: { padding: 14 },
  fieldLabel: { fontSize: 11, textAlign: "right", marginBottom: 6 },
  fieldInput: {
    fontSize: 16,
    paddingVertical: 2,
    borderBottomWidth: 1,
  },
  error: { fontSize: 11, textAlign: "right", marginTop: 4 },
  divider: { height: 1, marginHorizontal: 14 },
  gradeSelector: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 8,
  },
  gradeValue: { flex: 1, fontSize: 15, textAlign: "right" },
  gradeLabel: { fontSize: 11 },
  gradeList: { borderTopWidth: 1 },
  gradeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  gradeItemText: { fontSize: 14 },
  needPreview: {
    padding: 20,
    alignItems: "center",
    marginTop: 16,
  },
  needLabel: { fontSize: 13, marginBottom: 4 },
  needValue: { fontSize: 40 },
});
