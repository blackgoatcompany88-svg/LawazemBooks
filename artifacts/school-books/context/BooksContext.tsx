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
  academicYear: string;
  semester: 1 | 2;
  teacherCopies: number;
  receivedCount: number;
  deliveredCount: number;
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
  updateBookTracking: (
    id: string,
    tracking: Pick<BookEntry, "teacherCopies" | "receivedCount" | "deliveredCount">
  ) => void;
  deleteBook: (id: string) => void;
  updateSchoolInfo: (info: SchoolInfo) => void;
  updateGradeStudents: (grade: string, count: number) => void;
  getBook: (id: string) => BookEntry | undefined;
}

const BooksContext = createContext<BooksContextType | null>(null);

const BOOKS_KEY = "@school_books_v4";
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

export function getAcademicYear(date: Date = new Date()): string {
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return m >= 9 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

export function getSemester(date: Date = new Date()): 1 | 2 {
  const m = date.getMonth() + 1;
  return m >= 9 || m === 1 ? 1 : 2;
}

function calcNeed(students: number, schoolBalance: number): number {
  const need = students - schoolBalance;
  return need > 0 ? need : 0;
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function migrateBook(raw: Record<string, unknown>): BookEntry {
  const createdAt = (raw.createdAt as string) ?? new Date().toISOString();
  const d = new Date(createdAt);
  return {
    id: raw.id as string,
    number: (raw.number as number) ?? 0,
    bookName: (raw.bookName as string) ?? "",
    part: (raw.part as string) ?? "",
    grade: (raw.grade as string) ?? "",
    receivedLastYear: (raw.receivedLastYear as number) ?? 0,
    schoolBalance: (raw.schoolBalance as number) ?? 0,
    actualNeed: (raw.actualNeed as number) ?? 0,
    academicYear: (raw.academicYear as string) ?? getAcademicYear(d),
    semester: (raw.semester as 1 | 2) ?? getSemester(d),
    teacherCopies: (raw.teacherCopies as number) ?? 0,
    receivedCount: (raw.receivedCount as number) ?? 0,
    deliveredCount: (raw.deliveredCount as number) ?? 0,
    createdAt,
  };
}

export function BooksProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<BookEntry[]>([]);
  const [gradeStudents, setGradeStudents] = useState<Record<string, number>>({});
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    schoolName: "عائشة بنت أبي بكر الأساسية المختلطة",
    directorate: "مديرية تربية وتعليم محافظة العقبة",
    phone: "",
  });

  useEffect(() => {
    (async () => {
      const [booksData, schoolData, gradeData] = await Promise.all([
        AsyncStorage.getItem(BOOKS_KEY),
        AsyncStorage.getItem(SCHOOL_KEY),
        AsyncStorage.getItem(GRADE_STUDENTS_KEY),
      ]);
      if (booksData) {
        const raw = JSON.parse(booksData) as Record<string, unknown>[];
        setBooks(raw.map(migrateBook));
      }
      if (schoolData) setSchoolInfo(JSON.parse(schoolData));
      if (gradeData) setGradeStudents(JSON.parse(gradeData));
    })();
  }, []);

  const saveBooks = useCallback(async (updated: BookEntry[]) => {
    setBooks(updated);
    await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(updated));
  }, []);

  const addBook = useCallback(
    (data: Omit<BookEntry, "id" | "actualNeed" | "createdAt">) => {
      const students = gradeStudents[data.grade] ?? 0;
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
          ? { ...b, ...data, actualNeed: calcNeed(students, data.schoolBalance) }
          : b
      );
      saveBooks(updated);
    },
    [books, gradeStudents, saveBooks]
  );

  const updateBookTracking = useCallback(
    (
      id: string,
      tracking: Pick<BookEntry, "teacherCopies" | "receivedCount" | "deliveredCount">
    ) => {
      const updated = books.map((b) =>
        b.id === id ? { ...b, ...tracking } : b
      );
      saveBooks(updated);
    },
    [books, saveBooks]
  );

  const deleteBook = useCallback(
    (id: string) => saveBooks(books.filter((b) => b.id !== id)),
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
        updateBookTracking,
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
