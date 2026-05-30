import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { GlassCard } from "@/components/GlassCard";
import { BookEntry, useBooks } from "@/context/BooksContext";
import { useColors } from "@/hooks/useColors";
import { router } from "expo-router";

interface BookCardProps {
  book: BookEntry;
}

export function BookCard({ book }: BookCardProps) {
  const colors = useColors();
  const { deleteBook } = useBooks();

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("حذف الكتاب", `هل تريد حذف "${book.bookName}"؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => deleteBook(book.id),
      },
    ]);
  };

  const handleEdit = () => {
    router.push(`/book/${book.id}`);
  };

  const needColor =
    book.actualNeed > 0 ? colors.warning : colors.primary;

  return (
    <TouchableOpacity onPress={handleEdit} activeOpacity={0.85}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleDelete} hitSlop={8}>
              <Feather name="trash-2" size={16} color={colors.destructive} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEdit} hitSlop={8} style={{ marginLeft: 12 }}>
              <Feather name="edit-2" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.number, { color: colors.mutedForeground }]}>
              #{book.number}
            </Text>
            <Text
              style={[styles.bookName, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}
              numberOfLines={2}
            >
              {book.bookName}
            </Text>
            {book.part ? (
              <Text style={[styles.part, { color: colors.mutedForeground }]}>
                الجزء {book.part}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.gradeRow}>
          <View style={[styles.gradeBadge, { backgroundColor: "rgba(29,184,142,0.15)", borderColor: "rgba(29,184,142,0.3)" }]}>
            <Text style={[styles.gradeText, { color: colors.primary }]}>
              {book.grade}
            </Text>
          </View>
          <View style={[styles.needBadge, { backgroundColor: book.actualNeed > 0 ? "rgba(240,160,48,0.15)" : "rgba(29,184,142,0.10)", borderColor: book.actualNeed > 0 ? "rgba(240,160,48,0.3)" : "rgba(29,184,142,0.2)" }]}>
            <Text style={[styles.needValue, { color: needColor, fontFamily: "SpaceGrotesk_600SemiBold" }]}>
              {book.actualNeed}
            </Text>
            <Text style={[styles.needLabel, { color: needColor }]}>الحاجة</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <DataItem label="الحاجة الفعلية" value={book.actualNeed} color={needColor} />
          <DataItem label="عدد الطلاب" value={book.studentCount} color={colors.foreground} />
          <DataItem label="رصيد المدرسة" value={book.schoolBalance} color={colors.foreground} />
          <DataItem label="المستلم السابق" value={book.receivedLastYear} color={colors.mutedForeground} />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

function DataItem({
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
    <View style={styles.dataItem}>
      <Text style={[styles.dataValue, { color, fontFamily: "SpaceGrotesk_600SemiBold" }]}>
        {value}
      </Text>
      <Text style={[styles.dataLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 4,
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
    paddingLeft: 8,
  },
  number: {
    fontSize: 11,
    fontFamily: "SpaceGrotesk_400Regular",
    marginBottom: 2,
  },
  bookName: {
    fontSize: 16,
    textAlign: "right",
  },
  part: {
    fontSize: 12,
    marginTop: 2,
    textAlign: "right",
    fontFamily: "NotoKufiArabic_400Regular",
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  gradeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  gradeText: {
    fontSize: 12,
    fontFamily: "NotoKufiArabic_400Regular",
  },
  needBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  needValue: {
    fontSize: 14,
  },
  needLabel: {
    fontSize: 11,
    fontFamily: "NotoKufiArabic_400Regular",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dataItem: {
    alignItems: "center",
    flex: 1,
  },
  dataValue: {
    fontSize: 16,
  },
  dataLabel: {
    fontSize: 9,
    textAlign: "center",
    marginTop: 2,
    fontFamily: "NotoKufiArabic_400Regular",
  },
});
