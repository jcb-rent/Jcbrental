import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

export const colors = {
  primary: "#1D5F96",
  brandDark: "#12345A",
  brandSoft: "#E8F2FA",
  background: "#F4F8FC",
  surface: "#FFFFFF",
  text: "#17212B",
  muted: "#64748B",
  border: "#D7DEE7",
  success: "#16845B",
  warning: "#B7791F",
  danger: "#C2413B"
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export function Button({ label, onPress, disabled = false, variant = "primary" }: {
  label: string; onPress: () => void; disabled?: boolean; variant?: "primary" | "secondary";
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, variant === "secondary" && styles.secondary, disabled && styles.disabled, pressed && !disabled && styles.pressed]}
    >
      <Text style={[styles.buttonText, variant === "secondary" && styles.secondaryText]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  button: { minHeight: 50, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  secondary: { backgroundColor: colors.brandSoft, borderWidth: 1, borderColor: "#C7DDEE", flex: 1 },
  secondaryText: { color: colors.primary },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 8 }
});
