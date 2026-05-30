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
