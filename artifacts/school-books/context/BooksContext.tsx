import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface BookEntry {
  id: string;
  number: number;
  bookName: string;
  part: string;
  grade: string;
  receivedLastYear: number;
  schoolBalance: number;
  actualNeed: number;
  createdAt: string;
}

export interface SchoolInfo {
  schoolName: string;
  directorate: string;
  phone: string;
}

interface BooksContextType {
  books: BookEntry[];
  schoolInfo: SchoolInfo;
  gradeStudents: Record<string, number>;
  addBook: (book: Omit<BookEntry, "id" | "actualNeed" | "createdAt">) => void;
  updateBook: (
    id: string,
    book: Omit<BookEntry, "id" | "actualNeed" | "createdAt">
  ) => void;
  deleteBook: (id: string) => void;
  updateSchoolInfo: (info: SchoolInfo) => void;
  updateGradeStudents: (grade: string, count: number) => void;
  getBook: (id: string) => BookEntry | undefined;
}

const BooksContext = createContext<BooksContextType | null>(null);

const BOOKS_KEY = "@school_books_v2";
const SCHOOL_KEY = "@school_info_v1";
const GRADE_STUDENTS_KEY = "@grade_students_v1";

const SAMPLE_GRADES = [
  "الأول الأساسي",
  "الثاني الأساسي",
  "الثالث الأساسي",
  "الرابع الأساسي",
  "الخامس الأساسي",
  "السادس الأساسي",
  "السابع الأساسي",
  "الثامن الأساسي",
];

function calcNeed(students: number, schoolBalance: number): number {
  const need = students - schoolBalance;
  return need > 0 ? need : 0;
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function BooksProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<BookEntry[]>([]);
  const [gradeStudents, setGradeStudents] = useState<Record<string, number>>({});
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    schoolName: "عائشة بنت أبي بكر الأساسية المختلطة",
    directorate: "",
    phone: "",
  });

  useEffect(() => {
    (async () => {
      const [booksData, schoolData, gradeData] = await Promise.all([
        AsyncStorage.getItem(BOOKS_KEY),
        AsyncStorage.getItem(SCHOOL_KEY),
        AsyncStorage.getItem(GRADE_STUDENTS_KEY),
      ]);
      if (booksData) setBooks(JSON.parse(booksData));
      if (schoolData) setSchoolInfo(JSON.parse(schoolData));
      if (gradeData) setGradeStudents(JSON.parse(gradeData));
    })();
  }, []);

  const saveBooks = useCallback(async (updated: BookEntry[]) => {
    setBooks(updated);
    await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(updated));
  }, []);

  const addBook = useCallback(
    (
      data: Omit<BookEntry, "id" | "actualNeed" | "createdAt">,
      studentsOverride?: number
    ) => {
      const students = studentsOverride ?? gradeStudents[data.grade] ?? 0;
      const entry: BookEntry = {
        ...data,
        id: generateId(),
        actualNeed: calcNeed(students, data.schoolBalance),
        createdAt: new Date().toISOString(),
      };
      saveBooks([...books, entry]);
    },
    [books, gradeStudents, saveBooks]
  );

  const updateBook = useCallback(
    (id: string, data: Omit<BookEntry, "id" | "actualNeed" | "createdAt">) => {
      const students = gradeStudents[data.grade] ?? 0;
      const updated = books.map((b) =>
        b.id === id
          ? {
              ...b,
              ...data,
              actualNeed: calcNeed(students, data.schoolBalance),
            }
          : b
      );
      saveBooks(updated);
    },
    [books, gradeStudents, saveBooks]
  );

  const deleteBook = useCallback(
    (id: string) => {
      saveBooks(books.filter((b) => b.id !== id));
    },
    [books, saveBooks]
  );

  const updateSchoolInfo = useCallback(async (info: SchoolInfo) => {
    setSchoolInfo(info);
    await AsyncStorage.setItem(SCHOOL_KEY, JSON.stringify(info));
  }, []);

  const updateGradeStudents = useCallback(
    async (grade: string, count: number) => {
      const updated = { ...gradeStudents, [grade]: count };
      setGradeStudents(updated);
      await AsyncStorage.setItem(GRADE_STUDENTS_KEY, JSON.stringify(updated));

      // Recalculate actualNeed for all books in this grade
      const updatedBooks = books.map((b) =>
        b.grade === grade
          ? { ...b, actualNeed: calcNeed(count, b.schoolBalance) }
          : b
      );
      await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(updatedBooks));
      setBooks(updatedBooks);
    },
    [gradeStudents, books]
  );

  const getBook = useCallback(
    (id: string) => books.find((b) => b.id === id),
    [books]
  );

  return (
    <BooksContext.Provider
      value={{
        books,
        schoolInfo,
        gradeStudents,
        addBook,
        updateBook,
        deleteBook,
        updateSchoolInfo,
        updateGradeStudents,
        getBook,
      }}
    >
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error("useBooks must be used inside BooksProvider");
  return ctx;
}

export const GRADES = SAMPLE_GRADES;
