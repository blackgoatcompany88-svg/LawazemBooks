import {
  NotoKufiArabic_400Regular,
  NotoKufiArabic_700Bold,
  useFonts as useKufiFonts,
} from "@expo-google-fonts/noto-kufi-arabic";
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_600SemiBold,
  useFonts as useGroteskFonts,
} from "@expo-google-fonts/space-grotesk";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BooksProvider } from "@/context/BooksContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="book/new"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="book/[id]"
        options={{ headerShown: false, presentation: "modal" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [kufiLoaded, kufiError] = useKufiFonts({
    NotoKufiArabic_400Regular,
    NotoKufiArabic_700Bold,
  });

  const [groteskLoaded, groteskError] = useGroteskFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_600SemiBold,
  });

  const fontsLoaded = kufiLoaded && groteskLoaded;
  const fontError = kufiError || groteskError;

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const svg = encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      `<circle cx="50" cy="50" r="50" fill="#1DB88E"/>` +
      `<circle cx="50" cy="50" r="38" fill="#181C24"/>` +
      `<text x="50" y="60" text-anchor="middle" dominant-baseline="middle"` +
      ` font-size="18" fill="#1DB88E" font-family="Arial,sans-serif" font-weight="bold">` +
      `\u0627\u0644\u0644\u0648\u0627\u0632\u0645` +
      `</text></svg>`
    );
    const href = `data:image/svg+xml,${svg}`;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = href;
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BooksProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <StatusBar style="light" />
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </BooksProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
