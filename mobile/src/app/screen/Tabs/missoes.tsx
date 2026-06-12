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
import { missionsService } from "../../../service/missions";
import { realtimeService } from "../../../service/realtime";
import { notificationsService } from "../../../service/notifications";
import { Mission, MissionStatus, UserProgress, RealtimeEvent } from "../../../types";

export default function Missoes() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [m, p] = await Promise.all([
        missionsService.getMissions(),
        missionsService.getProgress(),
      ]);
      setMissions(m);
      setProgress(p);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar as missões.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRealtimeEvent = useCallback(
    async (event: RealtimeEvent) => {
      if (event.type === "mission-update" || event.type === "iot-data") {
        const updated = await missionsService.getMissions();
        setMissions(updated);
      }
    },
    [],
  );

  useEffect(() => {
    loadData();
    realtimeService.on("mission-update", handleRealtimeEvent);
    realtimeService.on("iot-data", handleRealtimeEvent);

    return () => {
      realtimeService.off("mission-update", handleRealtimeEvent);
      realtimeService.off("iot-data", handleRealtimeEvent);
    };
  }, [loadData, handleRealtimeEvent]);
  useEffect(() => {
    realtimeService.onConnectionChange(setSocketConnected);
    return () => {
      realtimeService.offConnectionChange(setSocketConnected);
    };
  }, []);
  const handleToggle = async (mission: Mission) => {
    setTogglingId(mission.id);
    try {
      const { missions: updated, progress: newProgress, leveledUp } =
        await missionsService.toggleMission(mission.id);
      setMissions(updated);
      setProgress(newProgress);

      if (mission.status !== MissionStatus.COMPLETED) {
        await notificationsService.sendMissionComplete(mission.title);
        if (leveledUp) {
          await notificationsService.sendLevelUp(
            newProgress.level,
            newProgress.levelTitle,
          );
        }
      }
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar a missão.");
    } finally {
      setTogglingId(null);
    }
  };

  const completedCount = missionsService.getCompletedCount(missions);

  const xpPercent = progress
    ? Math.min((progress.currentXP / progress.targetXP) * 100, 100)
    : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#005EBB" />
        <Text style={styles.loadingText}>Carregando progresso...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Seu progresso</Text>
        <Text style={styles.headerSub}>Acompanhe sua evolução</Text>

        {/* Card de nível */}
        {progress && (
          <View style={styles.levelCard}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelNumber}>{progress.level}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>Nível {progress.level}</Text>
              <Text style={styles.levelSubtitle}>{progress.levelTitle}</Text>
              <View style={styles.xpBarBg}>
                <View
                  style={[styles.xpBarFill, { width: `${xpPercent}%` as `${number}%` }]}
                />
              </View>
              <Text style={styles.xpText}>
                {progress.currentXP} / {progress.targetXP} XP
              </Text>
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={missions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Stats */}
            {progress && (
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="fire" color="#F59E0B" size={22} />
                  <Text style={styles.statValue}>{progress.streak}</Text>
                  <Text style={styles.statLabel}>Dias de{"\n"}sequência</Text>
                </View>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="check-circle" color="#22C55E" size={22} />
                  <Text style={styles.statValue}>{progress.completedMissions}</Text>
                  <Text style={styles.statLabel}>Missões{"\n"}concluídas</Text>
                </View>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="chart-line" color="#0073E6" size={22} />
                  <Text style={styles.statValue}>{progress.weeklyProgress}%</Text>
                  <Text style={styles.statLabel}>Progresso{"\n"}semanal</Text>
                </View>
              </View>
            )}

            {/* Título lista */}
            <View style={styles.missionListHeader}>
              <View>
                <Text style={styles.sectionTitle}>Missões da semana</Text>
                <Text style={styles.missionCount}>
                  {completedCount} de {missions.length} concluídas
                </Text>
              </View>
              <Text
                style={[
                  styles.realtimeStatus,
                  socketConnected ? styles.realtimeStatusOnline : styles.realtimeStatusOffline,
                ]}
              >
                {socketConnected ? 'Online em tempo real' : 'Reconectando...'}
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const isCompleted = item.status === MissionStatus.COMPLETED;
          const isToggling = togglingId === item.id;

          return (
            <View style={[styles.missionCard, isCompleted && styles.missionCardDone]}>
              <View
                style={[
                  styles.missionIconWrap,
                  { backgroundColor: `${item.color}1A` },
                ]}
              >
                <MaterialCommunityIcons
                  name={item.icon as never}
                  color={item.color}
                  size={22}
                />
              </View>
              <View style={styles.missionInfo}>
                <Text
                  style={[
                    styles.missionTitle,
                    isCompleted && styles.missionTitleDone,
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={styles.missionFreq}>{item.frequency}</Text>
                {item.status === MissionStatus.IN_PROGRESS && (
                  <View style={styles.progressWrap}>
                    <View style={styles.progressBg}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min((item.current / item.target) * 100, 100)}%` as `${number}%`,
                            backgroundColor: item.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {item.current}/{item.target} {item.unit}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleToggle(item)}
                disabled={isToggling}
                style={[
                  styles.toggleBtn,
                  isCompleted && { backgroundColor: item.color, borderColor: item.color },
                ]}
              >
                {isToggling ? (
                  <ActivityIndicator size="small" color={isCompleted ? "#FFF" : item.color} />
                ) : (
                  <MaterialCommunityIcons
                    name={isCompleted ? "check" : "circle-outline"}
                    color={isCompleted ? "#FFFFFF" : item.color}
                    size={18}
                  />
                )}
              </TouchableOpacity>
            </View>
          );
        }}
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
  },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  headerSub: { fontSize: 13, color: "#B3D4F5", marginTop: 4, marginBottom: 20 },

  levelCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  levelBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#005EBB",
    justifyContent: "center",
    alignItems: "center",
  },
  levelNumber: { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
  levelInfo: { flex: 1 },
  levelTitle: { fontSize: 16, fontWeight: "700", color: "#1A1F2B" },
  levelSubtitle: { fontSize: 12, color: "#64748B", marginBottom: 8 },
  xpBarBg: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  xpBarFill: { height: 6, backgroundColor: "#005EBB", borderRadius: 3 },
  xpText: { fontSize: 11, color: "#64748B", marginTop: 4 },

  listContent: { paddingHorizontal: 20, paddingBottom: 24 },

  statsRow: { flexDirection: "row", gap: 10, marginTop: 24, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  statValue: { fontSize: 20, fontWeight: "700", color: "#1A1F2B" },
  statLabel: { fontSize: 11, color: "#64748B", textAlign: "center", lineHeight: 16 },

  missionListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1A1F2B" },
  missionCount: { fontSize: 12, color: "#64748B" },
  realtimeStatus: {
    fontSize: 11,
    fontWeight: "700",
  },
  realtimeStatusOnline: {
    color: "#10B981",
  },
  realtimeStatusOffline: {
    color: "#F59E0B",
  },

  missionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  missionCardDone: { opacity: 0.85 },
  missionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  missionInfo: { flex: 1 },
  missionTitle: { fontSize: 14, fontWeight: "600", color: "#1A1F2B" },
  missionTitleDone: { textDecorationLine: "line-through", color: "#94A3B8" },
  missionFreq: { fontSize: 12, color: "#64748B", marginTop: 2 },
  progressWrap: { marginTop: 6, gap: 4 },
  progressBg: {
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: 4, borderRadius: 2 },
  progressText: { fontSize: 11, color: "#64748B" },
  toggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
});
