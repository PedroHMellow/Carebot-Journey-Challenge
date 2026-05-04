import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { habitsService } from "../../../service/habits";
import { Habit } from "../../../types";

const DAYS = ["S", "T", "Q", "Q", "S", "S", "D"];

export default function Habitos() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadHabits = useCallback(async () => {
    try {
      const data = await habitsService.getHabits();
      setHabits(data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os hábitos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const handleToggleToday = async (habit: Habit) => {
    setTogglingId(habit.id);
    try {
      const updated = await habitsService.toggleTodayHabit(habit.id);
      setHabits(updated);
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar o hábito.");
    } finally {
      setTogglingId(null);
    }
  };

  const overallRate = habits.length > 0
    ? Math.round(
        habits.reduce((acc, h) => acc + habitsService.getCompletionRate(h), 0) /
          habits.length,
      )
    : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#005EBB" />
        <Text style={styles.loadingText}>Carregando hábitos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Meus Hábitos</Text>
              <Text style={styles.headerSub}>
                Acompanhe sua consistência semanal
              </Text>

              {/* Resumo geral */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryLeft}>
                  <Text style={styles.summaryPercent}>{overallRate}%</Text>
                  <Text style={styles.summaryLabel}>Consistência geral</Text>
                </View>
                <View style={styles.summaryRight}>
                  <MaterialCommunityIcons name="chart-bar" color="#005EBB" size={40} />
                </View>
              </View>
            </View>

            {/* Cabeçalho dos dias */}
            <View style={styles.daysHeader}>
              <View style={styles.habitNameCol} />
              {DAYS.map((day, i) => (
                <Text key={i} style={styles.dayLabel}>
                  {day}
                </Text>
              ))}
              <View style={styles.toggleCol} />
            </View>
          </>
        }
        renderItem={({ item }) => {
          const streak = habitsService.getStreakCount(item);
          const rate = habitsService.getCompletionRate(item);
          const todayDone = item.weekHistory[6];
          const isToggling = togglingId === item.id;

          return (
            <View style={styles.habitCard}>
              <View style={styles.habitMain}>
                <View
                  style={[
                    styles.habitIconWrap,
                    { backgroundColor: `${item.color}1A` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon as never}
                    color={item.color}
                    size={20}
                  />
                </View>
                <View style={styles.habitInfo}>
                  <Text style={styles.habitName}>{item.name}</Text>
                  <Text style={styles.habitMeta}>
                    {item.category} • {rate}% esta semana
                    {streak > 0 ? ` • 🔥 ${streak}` : ""}
                  </Text>
                </View>
              </View>

              <View style={styles.weekRow}>
                <View style={styles.habitNameCol} />
                {item.weekHistory.map((done, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dayDot,
                      done
                        ? { backgroundColor: item.color }
                        : styles.dayDotEmpty,
                    ]}
                  />
                ))}
                <TouchableOpacity
                  onPress={() => handleToggleToday(item)}
                  disabled={isToggling}
                  style={[
                    styles.todayToggle,
                    todayDone
                      ? { backgroundColor: item.color, borderColor: item.color }
                      : { borderColor: item.color },
                  ]}
                >
                  {isToggling ? (
                    <ActivityIndicator
                      size="small"
                      color={todayDone ? "#FFF" : item.color}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={todayDone ? "check" : "plus"}
                      color={todayDone ? "#FFF" : item.color}
                      size={14}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="emoticon-sad-outline" color="#94A3B8" size={48} />
            <Text style={styles.emptyText}>Nenhum hábito encontrado.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: { marginTop: 12, color: "#64748B", fontSize: 14 },

  header: {
    backgroundColor: "#005EBB",
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 28,
    marginBottom: 0,
  },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  headerSub: { fontSize: 13, color: "#B3D4F5", marginTop: 4, marginBottom: 20 },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  summaryLeft: {},
  summaryPercent: { fontSize: 32, fontWeight: "800", color: "#005EBB" },
  summaryLabel: { fontSize: 13, color: "#64748B", marginTop: 2 },
  summaryRight: {},

  listContent: { paddingBottom: 24 },

  daysHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    marginTop: 0,
  },
  habitNameCol: { width: 52, marginRight: 8 },
  dayLabel: {
    width: 26,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
  },
  toggleCol: { width: 28, marginLeft: 8 },

  habitCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 14,
    padding: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  habitMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  habitIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  habitInfo: { flex: 1 },
  habitName: { fontSize: 14, fontWeight: "600", color: "#1A1F2B" },
  habitMeta: { fontSize: 11, color: "#64748B", marginTop: 2 },

  weekRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 4,
  },
  dayDotEmpty: {
    backgroundColor: "#E2E8F0",
  },
  todayToggle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: { fontSize: 15, color: "#94A3B8" },
});
