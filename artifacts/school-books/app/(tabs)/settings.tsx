import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { GlassCard } from "@/components/GlassCard";
import { SchoolInfo, useBooks } from "@/context/BooksContext";
import { useColors } from "@/hooks/useColors";

const NOTIF_KEY = "@notif_enabled_v1";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { schoolInfo, updateSchoolInfo, books, deleteBook } = useBooks();

  const [form, setForm] = useState<SchoolInfo>(schoolInfo);
  const [notifsEnabled, setNotifsEnabled] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(schoolInfo);
  }, [schoolInfo]);

  useEffect(() => {
    AsyncStorage.getItem(NOTIF_KEY).then((v) => {
      if (v === "true") setNotifsEnabled(true);
    });
  }, []);

  const handleSave = async () => {
    await updateSchoolInfo(form);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleNotifToggle = async (val: boolean) => {
    setNotifsEnabled(val);
    await AsyncStorage.setItem(NOTIF_KEY, val ? "true" : "false");
    if (val) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "مسح جميع البيانات",
      `سيتم حذف ${books.length} كتاب. هذا الإجراء لا يمكن التراجع عنه.`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "مسح الكل",
          style: "destructive",
          onPress: async () => {
            const ids = books.map((b) => b.id);
            for (const id of ids) deleteBook(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
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
        الإعدادات
      </Text>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        بيانات المدرسة
      </Text>

      <GlassCard style={styles.card}>
        <FieldInput
          label="اسم المدرسة"
          value={form.schoolName}
          onChangeText={(t) => setForm({ ...form, schoolName: t })}
          placeholder="أدخل اسم المدرسة"
          icon="home"
        />
        <View style={[styles.sep, { backgroundColor: colors.border }]} />
        {/* المديرية ثابتة غير قابلة للتعديل */}
        <View style={styles.field}>
          <Text style={[styles.fieldInput, { color: colors.foreground, fontFamily: "NotoKufiArabic_400Regular" }]}>
            مديرية تربية وتعليم محافظة العقبة
          </Text>
          <View style={styles.fieldLabelRow}>
            <Feather name="map-pin" size={14} color={colors.mutedForeground} />
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
              مديرية التربية
            </Text>
          </View>
        </View>
        <View style={[styles.sep, { backgroundColor: colors.border }]} />
        <FieldInput
          label="رقم الهاتف"
          value={form.phone}
          onChangeText={(t) => setForm({ ...form, phone: t })}
          placeholder="أدخل رقم الهاتف"
          icon="phone"
          keyboardType="phone-pad"
        />
      </GlassCard>

      <TouchableOpacity
        onPress={handleSave}
        style={[styles.saveBtn, { backgroundColor: saved ? "#1a9e78" : colors.primary }]}
        activeOpacity={0.85}
      >
        <Feather name={saved ? "check" : "save"} size={18} color="#fff" />
        <Text style={[styles.saveBtnText, { fontFamily: "NotoKufiArabic_700Bold" }]}>
          {saved ? "تم الحفظ!" : "حفظ البيانات"}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        الإشعارات
      </Text>

      <GlassCard style={styles.card}>
        <View style={styles.row}>
          <Switch
            value={notifsEnabled}
            onValueChange={handleNotifToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}>
              تذكير يومي
            </Text>
            <Text style={[styles.rowDesc, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
              تذكير بمراجعة وتحديث بيانات الكتب
            </Text>
          </View>
        </View>
      </GlassCard>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        إدارة البيانات
      </Text>

      <GlassCard style={styles.card}>
        <View style={styles.dataInfoRow}>
          <Text style={[styles.dataCount, { color: colors.accent, fontFamily: "SpaceGrotesk_600SemiBold" }]}>
            {books.length}
          </Text>
          <Text style={[styles.dataLabel, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
            كتاب مسجّل في النظام
          </Text>
        </View>
      </GlassCard>

      <TouchableOpacity
        onPress={handleClearData}
        style={[styles.dangerBtn, { borderColor: colors.destructive }]}
        activeOpacity={0.85}
      >
        <Feather name="trash-2" size={18} color={colors.destructive} />
        <Text style={[styles.dangerBtnText, { color: colors.destructive, fontFamily: "NotoKufiArabic_700Bold" }]}>
          مسح جميع البيانات
        </Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: colors.mutedForeground }]}>
        اللوازم المدرسية • الإصدار 1.0
      </Text>
    </ScrollView>
  );
}

function FieldInput({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  icon: keyof typeof Feather.glyphMap;
  keyboardType?: "default" | "phone-pad" | "numeric";
}) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <TextInput
        style={[styles.fieldInput, { color: colors.foreground, fontFamily: "NotoKufiArabic_400Regular" }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        textAlign="right"
        keyboardType={keyboardType ?? "default"}
      />
      <View style={styles.fieldLabelRow}>
        <Feather name={icon} size={14} color={colors.mutedForeground} />
        <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  pageTitle: {
    fontSize: 26,
    textAlign: "right",
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    textAlign: "right",
    marginBottom: 8,
    marginTop: 20,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: "NotoKufiArabic_400Regular",
  },
  card: {
    overflow: "hidden",
  },
  field: {
    padding: 14,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 12,
  },
  fieldInput: {
    fontSize: 15,
    paddingVertical: 4,
  },
  sep: {
    height: 1,
    marginHorizontal: 14,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveBtnText: {
    fontSize: 15,
    color: "#fff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 14,
  },
  rowText: {
    flex: 1,
    alignItems: "flex-end",
  },
  rowTitle: {
    fontSize: 15,
  },
  rowDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  dataInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    padding: 14,
  },
  dataCount: {
    fontSize: 28,
  },
  dataLabel: {
    fontSize: 14,
  },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  dangerBtnText: {
    fontSize: 15,
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 32,
    fontFamily: "NotoKufiArabic_400Regular",
  },
});
