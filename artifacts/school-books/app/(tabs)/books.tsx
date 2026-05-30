import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BookCard } from "@/components/BookCard";
import { EmptyState } from "@/components/EmptyState";
import { SearchBar } from "@/components/SearchBar";
import { GRADES, useBooks } from "@/context/BooksContext";
import { useColors } from "@/hooks/useColors";

export default function BooksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { books } = useBooks();

  const [search, setSearch] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = books;
    if (selectedGrade) {
      result = result.filter((b) => b.grade === selectedGrade);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (b) =>
          b.bookName.toLowerCase().includes(q) ||
          b.grade.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => a.number - b.number);
  }, [books, search, selectedGrade]);

  const usedGrades = useMemo(
    () => [...new Set(books.map((b) => b.grade))].sort(),
    [books]
  );

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/book/new");
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topInset + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text
          style={[styles.title, { color: colors.foreground, fontFamily: "NotoKufiArabic_700Bold" }]}
        >
          الكتب المدرسية
        </Text>
        <Text style={[styles.count, { color: colors.mutedForeground, fontFamily: "SpaceGrotesk_400Regular" }]}>
          {books.length} كتاب
        </Text>
        <View style={{ height: 12 }} />
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="بحث عن كتاب أو صف..."
        />
        {usedGrades.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}
          >
            <TouchableOpacity
              onPress={() => setSelectedGrade(null)}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    selectedGrade === null
                      ? colors.primary
                      : colors.glass,
                  borderColor:
                    selectedGrade === null
                      ? colors.primary
                      : colors.glassBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color:
                      selectedGrade === null
                        ? "#fff"
                        : colors.mutedForeground,
                  },
                ]}
              >
                الكل
              </Text>
            </TouchableOpacity>
            {usedGrades.map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() =>
                  setSelectedGrade((prev) => (prev === g ? null : g))
                }
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      selectedGrade === g ? colors.primary : colors.glass,
                    borderColor:
                      selectedGrade === g
                        ? colors.primary
                        : colors.glassBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        selectedGrade === g ? "#fff" : colors.mutedForeground,
                      fontFamily: "NotoKufiArabic_400Regular",
                    },
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookCard book={item} />}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom:
              Platform.OS === "web" ? 34 : insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="book"
            title={search || selectedGrade ? "لا توجد نتائج" : "لا توجد كتب بعد"}
            description={
              search || selectedGrade
                ? "جرّب البحث بكلمة أخرى"
                : "اضغط الزر + لإضافة كتاب جديد"
            }
            actionLabel={!search && !selectedGrade ? "إضافة كتاب" : undefined}
            onAction={!search && !selectedGrade ? handleAdd : undefined}
          />
        }
        scrollEnabled={!!filtered.length}
      />

      <TouchableOpacity
        onPress={handleAdd}
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            bottom: Platform.OS === "web" ? 34 : insets.bottom + 80,
          },
        ]}
        activeOpacity={0.85}
      >
        <Feather name="plus" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    textAlign: "right",
  },
  count: {
    fontSize: 13,
    textAlign: "right",
    marginTop: 2,
  },
  filterScroll: {
    marginTop: 10,
  },
  filterContent: {
    paddingRight: 4,
    gap: 8,
    flexDirection: "row-reverse",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
  },
  list: {
    padding: 20,
    paddingTop: 16,
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1DB88E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
