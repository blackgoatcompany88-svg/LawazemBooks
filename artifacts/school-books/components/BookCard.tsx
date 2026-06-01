import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

import { GlassCard } from "@/components/GlassCard";
import { BookEntry, useBooks } from "@/context/BooksContext";
import { useColors } from "@/hooks/useColors";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface BookCardProps {
  book: BookEntry;
  gradeStudents?: number;
}

export function BookCard({ book, gradeStudents = 0 }: BookCardProps) {
  const colors = useColors();
  const { deleteBook, updateBookTracking } = useBooks();
  const [trackingOpen, setTrackingOpen] = useState(false);

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("حذف الكتاب", `هل تريد حذف "${book.bookName}"؟`, [
      { text: "إلغاء", style: "cancel" },
      { text: "حذف", style: "destructive", onPress: () => deleteBook(book.id) },
    ]);
  };

  const handleEdit = () => router.push(`/book/${book.id}`);

  const toggleTracking = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTrackingOpen((v) => !v);
  };

  const needColor = book.actualNeed > 0 ? colors.warning : colors.primary;

  const totalDistributed = book.deliveredCount + book.teacherCopies;
  const remaining = book.receivedCount - totalDistributed;
  const remainingColor =
    remaining < 0 ? colors.destructive : remaining === 0 ? colors.mutedForeground : colors.primary;

  const hasTracking =
    book.teacherCopies > 0 || book.receivedCount > 0 || book.deliveredCount > 0;

  return (
    <View style={styles.wrapper}>
      <GlassCard style={styles.card}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleDelete} hitSlop={8}>
              <Feather name="trash-2" size={16} color={colors.destructive} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEdit} hitSlop={8} style={{ marginLeft: 12 }}>
              <Feather name="edit-2" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <View style={styles.titleSide}>
            <Text style={[styles.number, { color: colors.mutedForeground, fontFamily: "SpaceGrotesk_400Regular" }]}>
              #{book.number}
            </Text>
            <Text
              style={[styles.bookName, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}
              numberOfLines={2}
            >
              {book.bookName}
            </Text>
            {book.part ? (
              <Text style={[styles.part, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
                الجزء {book.part}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          <DataItem label="الحاجة" value={book.actualNeed} color={needColor} />
          {gradeStudents > 0 && (
            <DataItem label="الطلاب" value={gradeStudents} color={colors.accent} />
          )}
          <DataItem label="الرصيد" value={book.schoolBalance} color={colors.primary} />
          <DataItem label="العام الماضي" value={book.receivedLastYear} color={colors.mutedForeground} />
        </View>

        {/* ── Progress bar ── */}
        {gradeStudents > 0 && (
          <View style={[styles.needStrip, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.needFill,
                {
                  backgroundColor: needColor,
                  width: `${Math.min(100, Math.round((book.schoolBalance / gradeStudents) * 100))}%` as any,
                },
              ]}
            />
          </View>
        )}

        {/* ── Tracking summary badges (when closed but has data) ── */}
        {hasTracking && !trackingOpen && (
          <View style={styles.badgeRow}>
            <Badge
              icon="download"
              label="مستلم"
              value={book.receivedCount}
              color="rgba(29,184,142,0.7)"
            />
            <Badge
              icon="upload"
              label="مسلَّم"
              value={book.deliveredCount}
              color="rgba(240,160,48,0.7)"
            />
            {book.teacherCopies > 0 && (
              <Badge
                icon="user"
                label="معلم"
                value={book.teacherCopies}
                color={colors.mutedForeground}
              />
            )}
          </View>
        )}

        {/* ── Tracking toggle button ── */}
        <TouchableOpacity
          onPress={toggleTracking}
          style={[
            styles.trackingToggle,
            {
              backgroundColor: trackingOpen
                ? "rgba(29,184,142,0.12)"
                : colors.muted,
              borderColor: trackingOpen
                ? "rgba(29,184,142,0.3)"
                : colors.border,
            },
          ]}
          activeOpacity={0.8}
        >
          <Feather
            name={trackingOpen ? "chevron-up" : "bar-chart-2"}
            size={13}
            color={trackingOpen ? colors.primary : colors.mutedForeground}
          />
          <Text
            style={[
              styles.trackingToggleText,
              {
                color: trackingOpen ? colors.primary : colors.mutedForeground,
                fontFamily: "NotoKufiArabic_400Regular",
              },
            ]}
          >
            {trackingOpen ? "إخفاء التتبع" : "تتبع التوزيع"}
          </Text>
        </TouchableOpacity>

        {/* ── Tracking panel ── */}
        {trackingOpen && (
          <TrackingPanel book={book} onUpdate={updateBookTracking} />
        )}
      </GlassCard>
    </View>
  );
}

// ─── Tracking panel ───────────────────────────────────────────────────────────
function TrackingPanel({
  book,
  onUpdate,
}: {
  book: BookEntry;
  onUpdate: (
    id: string,
    t: Pick<BookEntry, "teacherCopies" | "receivedCount" | "deliveredCount">
  ) => void;
}) {
  const colors = useColors();

  const [local, setLocal] = useState({
    teacherCopies: book.teacherCopies,
    receivedCount: book.receivedCount,
    deliveredCount: book.deliveredCount,
  });

  const update = (field: keyof typeof local, val: number) => {
    const next = { ...local, [field]: Math.max(0, val) };
    setLocal(next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUpdate(book.id, next);
  };

  const totalDistributed = local.deliveredCount + local.teacherCopies;
  const remaining = local.receivedCount - totalDistributed;
  const remainingColor =
    remaining < 0
      ? colors.destructive
      : remaining === 0
      ? colors.mutedForeground
      : colors.primary;

  return (
    <View
      style={[
        styles.trackingPanel,
        { borderTopColor: colors.border, backgroundColor: "rgba(29,184,142,0.04)" },
      ]}
    >
      {/* المستلم */}
      <TrackRow
        icon="download"
        label="المستلَم"
        sublabel="من المستودع"
        value={local.receivedCount}
        iconColor={colors.primary}
        onDec={() => update("receivedCount", local.receivedCount - 1)}
        onInc={() => update("receivedCount", local.receivedCount + 1)}
        onEdit={(v) => update("receivedCount", v)}
      />

      <View style={[styles.trackDivider, { backgroundColor: colors.border }]} />

      {/* نسخ معلم */}
      <TrackRow
        icon="user"
        label="نسخ المعلم"
        sublabel="تُحتسب ضمن التوزيع"
        value={local.teacherCopies}
        iconColor={colors.mutedForeground}
        onDec={() => update("teacherCopies", local.teacherCopies - 1)}
        onInc={() => update("teacherCopies", local.teacherCopies + 1)}
        onEdit={(v) => update("teacherCopies", v)}
      />

      <View style={[styles.trackDivider, { backgroundColor: colors.border }]} />

      {/* المسلّم للطلاب */}
      <TrackRow
        icon="upload"
        label="المسلَّم للطلاب"
        value={local.deliveredCount}
        iconColor={colors.accent}
        onDec={() => update("deliveredCount", local.deliveredCount - 1)}
        onInc={() => update("deliveredCount", local.deliveredCount + 1)}
        onEdit={(v) => update("deliveredCount", v)}
      />

      {/* إجمالي التوزيع */}
      <View style={[styles.totalRow, { backgroundColor: "rgba(240,160,48,0.07)", borderColor: "rgba(240,160,48,0.2)" }]}>
        <Text style={[styles.totalLabel, { color: colors.accent, fontFamily: "NotoKufiArabic_400Regular" }]}>
          إجمالي الموزَّع (طلاب + معلمون)
        </Text>
        <Text style={[styles.totalValue, { color: colors.accent, fontFamily: "SpaceGrotesk_600SemiBold" }]}>
          {totalDistributed}
        </Text>
      </View>

      {/* المتبقي */}
      <View
        style={[
          styles.remainingRow,
          {
            backgroundColor: remaining < 0 ? "rgba(239,68,68,0.08)" : "rgba(29,184,142,0.08)",
            borderColor: remaining < 0 ? "rgba(239,68,68,0.2)" : "rgba(29,184,142,0.2)",
          },
        ]}
      >
        <Feather
          name={remaining < 0 ? "alert-circle" : "package"}
          size={14}
          color={remainingColor}
        />
        <Text style={[styles.remainingLabel, { color: remainingColor, fontFamily: "NotoKufiArabic_400Regular" }]}>
          {remaining < 0
            ? `عجز ${Math.abs(remaining)} نسخة`
            : `المتبقي في المخزن: ${remaining} نسخة`}
        </Text>
      </View>
    </View>
  );
}

// ─── Single tracking row with +/- and tap-to-edit ─────────────────────────────
function TrackRow({
  icon,
  label,
  sublabel,
  value,
  iconColor,
  onDec,
  onInc,
  onEdit,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  sublabel?: string;
  value: number;
  iconColor: string;
  onDec: () => void;
  onInc: () => void;
  onEdit: (v: number) => void;
}) {
  const colors = useColors();
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState(String(value));

  const commit = () => {
    const n = parseInt(raw, 10);
    onEdit(isNaN(n) || n < 0 ? 0 : n);
    setEditing(false);
  };

  return (
    <View style={styles.trackRow}>
      {/* Right: icon + label */}
      <View style={styles.trackLabel}>
        <Feather name={icon} size={14} color={iconColor} />
        <View>
          <Text
            style={[styles.trackLabelText, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}
          >
            {label}
          </Text>
          {sublabel && (
            <Text
              style={[styles.trackSublabel, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}
            >
              {sublabel}
            </Text>
          )}
        </View>
      </View>

      {/* Left: counter */}
      <View style={styles.counter}>
        <TouchableOpacity
          onPress={onInc}
          style={[styles.counterBtn, { backgroundColor: "rgba(29,184,142,0.15)", borderColor: "rgba(29,184,142,0.3)" }]}
          hitSlop={6}
          activeOpacity={0.7}
        >
          <Feather name="plus" size={14} color={colors.primary} />
        </TouchableOpacity>

        {editing ? (
          <TextInput
            style={[styles.counterInput, { color: colors.foreground, borderColor: colors.primary, fontFamily: "SpaceGrotesk_600SemiBold" }]}
            value={raw}
            onChangeText={setRaw}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={commit}
            onBlur={commit}
            autoFocus
            selectTextOnFocus
            textAlign="center"
          />
        ) : (
          <TouchableOpacity onPress={() => { setRaw(String(value)); setEditing(true); }} hitSlop={6}>
            <Text style={[styles.counterValue, { color: colors.foreground, fontFamily: "SpaceGrotesk_600SemiBold" }]}>
              {value}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={onDec}
          style={[styles.counterBtn, { backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.25)" }]}
          hitSlop={6}
          activeOpacity={0.7}
        >
          <Feather name="minus" size={14} color={colors.destructive} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Badge (compact summary) ──────────────────────────────────────────────────
function Badge({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={[styles.badge, { borderColor: color + "55", backgroundColor: color + "18" }]}>
      <Feather name={icon} size={10} color={color} />
      <Text style={[styles.badgeText, { color, fontFamily: "SpaceGrotesk_400Regular" }]}>
        {value}
      </Text>
      <Text style={[styles.badgeLabel, { color, fontFamily: "NotoKufiArabic_400Regular" }]}>
        {label}
      </Text>
    </View>
  );
}

// ─── Generic data item ────────────────────────────────────────────────────────
function DataItem({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = useColors();
  return (
    <View style={styles.dataItem}>
      <Text style={[styles.dataValue, { color, fontFamily: "SpaceGrotesk_600SemiBold" }]}>
        {value}
      </Text>
      <Text style={[styles.dataLabel, { color: colors.mutedForeground, fontFamily: "NotoKufiArabic_400Regular" }]}>
        {label}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: { marginBottom: 10 },
  card: { padding: 14 },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  actions: { flexDirection: "row", alignItems: "center", paddingTop: 4 },
  titleSide: { flex: 1, alignItems: "flex-end", paddingLeft: 8 },
  number: { fontSize: 11, marginBottom: 2 },
  bookName: { fontSize: 15, textAlign: "right" },
  part: { fontSize: 12, marginTop: 2, textAlign: "right" },

  divider: { height: 1, marginBottom: 10 },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  dataItem: { alignItems: "center" },
  dataValue: { fontSize: 18 },
  dataLabel: { fontSize: 10, marginTop: 2 },

  needStrip: { height: 4, borderRadius: 2, overflow: "hidden", marginBottom: 10 },
  needFill: { height: "100%", borderRadius: 2 },

  badgeRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 6,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: { fontSize: 12 },
  badgeLabel: { fontSize: 10 },

  trackingToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 2,
  },
  trackingToggleText: { fontSize: 12 },

  // Tracking panel
  trackingPanel: {
    marginTop: 10,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  trackDivider: { height: 1, marginVertical: 8 },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  trackLabel: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "flex-end",
  },
  trackLabelText: { fontSize: 13, textAlign: "right" },
  trackSublabel: { fontSize: 10, textAlign: "right" },

  counter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 12,
  },
  counterBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  counterValue: { fontSize: 18, minWidth: 36, textAlign: "center" },
  counterInput: {
    fontSize: 18,
    minWidth: 50,
    textAlign: "center",
    borderBottomWidth: 1,
    paddingVertical: 0,
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  totalLabel: { fontSize: 12 },
  totalValue: { fontSize: 20 },

  remainingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "flex-end",
  },
  remainingLabel: { fontSize: 13 },
});
