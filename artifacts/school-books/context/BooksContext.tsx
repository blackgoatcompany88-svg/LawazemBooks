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
  studentCount: number;
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
  addBook: (book: Omit<BookEntry, "id" | "actualNeed" | "createdAt">) => void;
  updateBook: (
    id: string,
    book: Omit<BookEntry, "id" | "actualNeed" | "createdAt">
  ) => void;
  deleteBook: (id: string) => void;
  updateSchoolInfo: (info: SchoolInfo) => void;
  getBook: (id: string) => BookEntry | undefined;
}

const BooksContext = createContext<BooksContextType | null>(null);

const BOOKS_KEY = "@school_books_v1";
const SCHOOL_KEY = "@school_info_v1";

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

function calcNeed(studentCount: number, schoolBalance: number): number {
  const need = studentCount - schoolBalance;
  return need > 0 ? need : 0;
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function BooksProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<BookEntry[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    schoolName: "عائشة بنت أبي بكر الأساسية المختلطة",
    directorate: "",
    phone: "",
  });

  useEffect(() => {
    (async () => {
      const [booksData, schoolData] = await Promise.all([
        AsyncStorage.getItem(BOOKS_KEY),
        AsyncStorage.getItem(SCHOOL_KEY),
      ]);
      if (booksData) setBooks(JSON.parse(booksData));
      if (schoolData) setSchoolInfo(JSON.parse(schoolData));
    })();
  }, []);

  const saveBooks = useCallback(async (updated: BookEntry[]) => {
    setBooks(updated);
    await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(updated));
  }, []);

  const addBook = useCallback(
    (data: Omit<BookEntry, "id" | "actualNeed" | "createdAt">) => {
      const entry: BookEntry = {
        ...data,
        id: generateId(),
        actualNeed: calcNeed(data.studentCount, data.schoolBalance),
        createdAt: new Date().toISOString(),
      };
      saveBooks([...books, entry]);
    },
    [books, saveBooks]
  );

  const updateBook = useCallback(
    (id: string, data: Omit<BookEntry, "id" | "actualNeed" | "createdAt">) => {
      const updated = books.map((b) =>
        b.id === id
          ? {
              ...b,
              ...data,
              actualNeed: calcNeed(data.studentCount, data.schoolBalance),
            }
          : b
      );
      saveBooks(updated);
    },
    [books, saveBooks]
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

  const getBook = useCallback(
    (id: string) => books.find((b) => b.id === id),
    [books]
  );

  return (
    <BooksContext.Provider
      value={{
        books,
        schoolInfo,
        addBook,
        updateBook,
        deleteBook,
        updateSchoolInfo,
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
