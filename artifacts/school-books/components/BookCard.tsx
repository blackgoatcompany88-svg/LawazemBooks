import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { GlassCard } from "@/components/GlassCard";
import { BookEntry, useBooks } from "@/context/BooksContext";
import { useColors } from "@/hooks/useColors";
import { router } from "expo-router";

interface BookCardProps {
  book: BookEntry;
  gradeStudents?: number;
}

export function BookCard({ book, gradeStudents = 0 }: BookCardProps) {
  const colors = useColors();
  const { deleteBook } = useBooks();

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("حذف الكتاب", `هل تريد حذف "${book.bookName}"؟`, [
      { text: "إلغاء", style: "cancel" },
      { text: "حذف", style: "destructive", onPress: () => deleteBook(book.id) },
    ]);
  };

  const handleEdit = () => router.push(`/book/${book.id}`);

  const needColor = book.actualNeed > 0 ? colors.warning : colors.primary;

  return (
    <TouchableOpacity onPress={handleEdit} activeOpacity={0.85} style={styles.wrapper}>
      <GlassCard style={styles.card}>
        {/* Header */}
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

        {/* Stats row */}
        <View style={styles.statsRow}>
          <DataItem label="الحاجة" value={book.actualNeed} color={needColor} />
          {gradeStudents > 0 && (
            <DataItem label="الطلاب" value={gradeStudents} color={colors.accent} />
          )}
          <DataItem label="الرصيد" value={book.schoolBalance} color={colors.primary} />
          <DataItem label="مستلم" value={book.receivedLastYear} color={colors.mutedForeground} />
        </View>

        {/* Need indicator strip */}
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
      </GlassCard>
    </TouchableOpacity>
  );
}

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

const styles = StyleSheet.create({
  wrapper: { marginBottom: 10 },
  card: { padding: 14 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 },
  actions: { flexDirection: "row", alignItems: "center", paddingTop: 4 },
  titleSide: { flex: 1, alignItems: "flex-end", paddingLeft: 8 },
  number: { fontSize: 11, marginBottom: 2 },
  bookName: { fontSize: 15, textAlign: "right" },
  part: { fontSize: 12, marginTop: 2, textAlign: "right" },
  divider: { height: 1, marginBottom: 10 },
  statsRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 10 },
  dataItem: { alignItems: "center" },
  dataValue: { fontSize: 18 },
  dataLabel: { fontSize: 10, marginTop: 2 },
  needStrip: { height: 4, borderRadius: 2, overflow: "hidden", marginTop: 2 },
  needFill: { height: "100%", borderRadius: 2 },
});
