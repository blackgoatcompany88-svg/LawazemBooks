import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
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

import { GlassCard } from "@/components/GlassCard";
import { PinLock } from "@/components/PinLock";
import { PIN_KEY } from "@/app/_layout";
import { SchoolInfo, useBooks } from "@/context/BooksContext";
import { useColors } from "@/hooks/useColors";

const NOTIF_KEY = "@notif_enabled_v1";

type PinFlow = "verify-old" | "set-new" | "confirm-new" | null;

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { schoolInfo, updateSchoolInfo, books, deleteBook } = useBooks();

  const [form, setForm] = useState<SchoolInfo>(schoolInfo);
  const [notifsEnabled, setNotifsEnabled] = useState(false);
  const [saved, setSaved] = useState(false);

  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [pinFlow, setPinFlow] = useState<PinFlow>(null);
  const [newPinTemp, setNewPinTemp] = useState("");
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    setForm(schoolInfo);
  }, [schoolInfo]);

  useEffect(() => {
    AsyncStorage.getItem(NOTIF_KEY).then((v) => {
      if (v === "true") setNotifsEnabled(true);
    });
    AsyncStorage.getItem(PIN_KEY).then((p) => setStoredPin(p));
  }, []);

  const handleSave = async () => {
    await updateSchoolInfo({ ...form, directorate: "مديرية تربية وتعليم محافظة العقبة" });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleNotifToggle = async (val: boolean) => {
    setNotifsEnabled(val);
    await AsyncStorage.setItem(NOTIF_KEY, val ? "true" : "false");
    if (val) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  // PIN flow handlers
  const startSetPin = () => {
    if (storedPin) {
      setPinFlow("verify-old");
    } else {
      setPinFlow("set-new");
    }
  };

  const handleRemovePin = () => {
    Alert.alert("حذف كلمة السر", "هل تريد إلغاء قفل التطبيق؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          if (storedPin) {
            setPinFlow("verify-old");
            setNewPinTemp("REMOVE");
          }
        },
      },
    ]);
  };

  const handlePinFlowComplete = async (pin: string) => {
    if (pinFlow === "verify-old") {
      if (pin !== storedPin) {
        setPinError(true);
        setTimeout(() => setPinError(false), 800);
        return;
      }
      setPinError(false);
      if (newPinTemp === "REMOVE") {
        await AsyncStorage.removeItem(PIN_KEY);
        setStoredPin(null);
        setNewPinTemp("");
        setPinFlow(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setPinFlow("set-new");
      }
    } else if (pinFlow === "set-new") {
      setNewPinTemp(pin);
      setPinFlow("confirm-new");
    } else if (pinFlow === "confirm-new") {
      if (pin !== newPinTemp) {
        setPinError(true);
        setTimeout(() => setPinError(false), 800);
        return;
      }
      setPinError(false);
      await AsyncStorage.setItem(PIN_KEY, pin);
      setStoredPin(pin);
      setNewPinTemp("");
      setPinFlow(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("تم!", "تم تفعيل كلمة السر بنجاح.");
    }
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <>
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

        {/* PIN Lock Section */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          الأمان
        </Text>

        <GlassCard style={styles.card}>
          <View style={styles.pinRow}>
            <View style={styles.pinInfo}>
              <View style={[styles.pinIcon, { backgroundColor: storedPin ? "rgba(29,184,142,0.15)" : "rgba(255,255,255,0.06)", borderColor: storedPin ? "rgba(29,184,142,0.3)" : colors.glassBorder }]}>
                <Feather name={storedPin ? "lock" : "unlock"} size={20} color={storedPin ? colors.primary : colors.mutedForeground} />
              </View>
              <View style={styles.pinText}>
                <Text style={[styles.pinTitle, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}>
                  {storedPin ? "كلمة السر مفعّلة" : "قفل التطبيق"}
                </Text>
                <Text style={[styles.pinDesc, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
                  {storedPin ? "يُطلب رمز عند فتح التطبيق" : "أضف رمز PIN لحماية البيانات"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={startSetPin}
              style={[styles.pinBtn, { backgroundColor: storedPin ? "rgba(29,184,142,0.12)" : colors.primary, borderColor: storedPin ? "rgba(29,184,142,0.3)" : "transparent" }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.pinBtnText, { color: storedPin ? colors.primary : "#fff", fontFamily: "NotoKufiArabic_700Bold" }]}>
                {storedPin ? "تغيير" : "تفعيل"}
              </Text>
            </TouchableOpacity>
          </View>

          {storedPin && (
            <>
              <View style={[styles.sep, { backgroundColor: colors.border }]} />
              <TouchableOpacity onPress={handleRemovePin} style={styles.removePinRow}>
                <Feather name="trash-2" size={15} color={colors.destructive} />
                <Text style={[styles.removePinText, { color: colors.destructive, fontFamily: "NotoKufiArabic_400Regular" }]}>
                  إلغاء كلمة السر
                </Text>
              </TouchableOpacity>
            </>
          )}
        </GlassCard>

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

      {/* PIN Flow Modal */}
      <Modal visible={pinFlow !== null} animationType="slide" statusBarTranslucent>
        {pinFlow === "verify-old" && (
          <PinLock
            title="أدخل كلمة السر الحالية"
            subtitle="للتحقق من هويتك"
            onComplete={handlePinFlowComplete}
            onCancel={() => { setPinFlow(null); setNewPinTemp(""); }}
            error={pinError}
            showCancel
          />
        )}
        {pinFlow === "set-new" && (
          <PinLock
            title="أدخل كلمة السر الجديدة"
            subtitle="اختر رمز PIN من 4 أرقام"
            onComplete={handlePinFlowComplete}
            onCancel={() => { setPinFlow(null); setNewPinTemp(""); }}
            error={pinError}
            showCancel
          />
        )}
        {pinFlow === "confirm-new" && (
          <PinLock
            title="تأكيد كلمة السر"
            subtitle="أعد إدخال الرمز للتأكيد"
            onComplete={handlePinFlowComplete}
            onCancel={() => { setPinFlow(null); setNewPinTemp(""); }}
            error={pinError}
            showCancel
          />
        )}
      </Modal>
    </>
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
  pageTitle: { fontSize: 26, textAlign: "right", marginBottom: 20 },
  sectionLabel: {
    fontSize: 12, textAlign: "right", marginBottom: 8, marginTop: 20,
    textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "NotoKufiArabic_400Regular",
  },
  card: { overflow: "hidden" },
  field: { padding: 14 },
  fieldLabelRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 6, marginBottom: 6 },
  fieldLabel: { fontSize: 12 },
  fieldInput: { fontSize: 15, paddingVertical: 4 },
  sep: { height: 1, marginHorizontal: 14 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 14, paddingVertical: 14, borderRadius: 14 },
  saveBtnText: { fontSize: 15, color: "#fff" },

  pinRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  pinInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  pinIcon: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  pinText: { flex: 1, alignItems: "flex-end" },
  pinTitle: { fontSize: 14 },
  pinDesc: { fontSize: 11, marginTop: 2, textAlign: "right" },
  pinBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  pinBtnText: { fontSize: 13 },
  removePinRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8, padding: 12, paddingHorizontal: 16 },
  removePinText: { fontSize: 13 },

  row: { flexDirection: "row", alignItems: "center", padding: 14, gap: 14 },
  rowText: { flex: 1, alignItems: "flex-end" },
  rowTitle: { fontSize: 15 },
  rowDesc: { fontSize: 12, marginTop: 2 },
  dataInfoRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8, padding: 14 },
  dataCount: { fontSize: 28 },
  dataLabel: { fontSize: 14 },
  dangerBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 14, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  dangerBtnText: { fontSize: 15 },
  version: { textAlign: "center", fontSize: 12, marginTop: 32, fontFamily: "NotoKufiArabic_400Regular" },
});
