import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, colors, spacing } from "@jcb/design-system";
import { demoMachines } from "@jcb/demo-data";

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>JCB RENTAL SERVICE</Text>
          <Text style={styles.title}>Find the right machine for your site.</Text>
          <Text style={styles.subtitle}>Reliable equipment. Clear rental details. Work on your schedule.</Text>
        </View>
        <Button label="Book a machine" onPress={() => {}} />
        <Text style={styles.section}>Available equipment</Text>
        {demoMachines.map((machine) => (
          <Card key={machine.id}>
            <View style={styles.machineRow}>
              <View style={styles.machineIcon}><Text style={styles.iconText}>JCB</Text></View>
              <View style={styles.machineInfo}>
                <Text style={styles.machineName}>{machine.name}</Text>
                <Text style={styles.machineMeta}>{machine.category} · {machine.availability}</Text>
              </View>
            </View>
          </Card>
        ))}
        <Text style={styles.note}>Demo preview · Availability and booking actions are simulated.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  page: { padding: spacing.xl, gap: spacing.md },
  header: { paddingTop: spacing.xl, paddingBottom: spacing.md, gap: spacing.sm },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 30, lineHeight: 36, fontWeight: "800" },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  section: { color: colors.text, fontSize: 19, fontWeight: "800", marginTop: spacing.lg },
  machineRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  machineIcon: { width: 54, height: 54, borderRadius: 14, backgroundColor: colors.brandSoft, alignItems: "center", justifyContent: "center" },
  iconText: { color: colors.primary, fontWeight: "900" },
  machineInfo: { flex: 1, gap: 4 },
  machineName: { color: colors.text, fontSize: 16, fontWeight: "700" },
  machineMeta: { color: colors.muted, fontSize: 13 },
  note: { color: colors.muted, fontSize: 12, textAlign: "center", marginTop: spacing.md }
});
