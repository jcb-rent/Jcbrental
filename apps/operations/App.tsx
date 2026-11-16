import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button, Card, colors, spacing } from "@jcb/design-system";

type Role = "owner" | "driver";

export default function App() {
  const [pin, setPin] = useState("");
  const [previewRole, setPreviewRole] = useState<Role | null>(null);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <Text style={styles.eyebrow}>JCB RENTAL SERVICE</Text>
        <Text style={styles.title}>Operations</Text>
        <Text style={styles.subtitle}>One secure workspace for owners and drivers.</Text>
        <Card>
          <Text style={styles.cardTitle}>PIN sign-in</Text>
          <Text style={styles.helper}>Enter your six-digit PIN. Role verification will be connected to the secure backend in the production phase.</Text>
          <TextInput
            value={pin}
            onChangeText={(value) => setPin(value.replace(/\D/g, "").slice(0, 6))}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            placeholder="••••••"
            placeholderTextColor={colors.muted}
            style={styles.pin}
            accessibilityLabel="Six digit PIN"
          />
          <Button label="Continue" disabled={pin.length !== 6} onPress={() => {}} />
        </Card>
        <Text style={styles.section}>Preview demo screens</Text>
        <View style={styles.actions}>
          <Button label="Owner preview" variant="secondary" onPress={() => setPreviewRole("owner")} />
          <Button label="Driver preview" variant="secondary" onPress={() => setPreviewRole("driver")} />
        </View>
        {previewRole && (
          <Card>
            <Text style={styles.cardTitle}>{previewRole === "owner" ? "Owner dashboard shell" : "Driver duty shell"}</Text>
            <Text style={styles.helper}>{previewRole === "owner" ? "Fleet, bookings, drivers and business controls will be built in Phase 03." : "Assigned duty, Start Work and location tracking controls will be built in Phase 04."}</Text>
            {previewRole === "driver" && <Button label="Start work (demo placeholder)" disabled onPress={() => {}} />}
          </Card>
        )}
        <Text style={styles.note}>Demo only · PIN verification and GPS are not active.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  page: { flex: 1, padding: spacing.xl, justifyContent: "center", gap: spacing.md },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 30, fontWeight: "800" },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginBottom: spacing.md },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: "800", marginBottom: spacing.sm },
  helper: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  pin: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, fontSize: 22, letterSpacing: 8, textAlign: "center", color: colors.text, marginVertical: spacing.md },
  section: { color: colors.text, fontSize: 16, fontWeight: "800", marginTop: spacing.md },
  actions: { flexDirection: "row", gap: spacing.sm },
  note: { color: colors.muted, fontSize: 12, textAlign: "center" }
});
