import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { authService, User } from "../../../service/auth";
import { missionsService } from "../../../service/missions";
import { realtimeService } from "../../../service/realtime";
import { iotService } from "../../../service/iot";
import { notificationsService } from "../../../service/notifications";
import { Mission, MissionStatus, IoTData, RealtimeEvent } from "../../../types";

interface QuickAccessItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  route: string;
}

interface RecommendationItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

const QUICK_ACCESS: QuickAccessItem[] = [
  { id: "1", label: "Dashboard", icon: "view-dashboard", color: "#005EBB", route: "/screen/Tabs/missoes" },
  { id: "2", label: "Missões", icon: "target", color: "#0073E6", route: "/screen/Tabs/missoes" },
  { id: "3", label: "Hábitos", icon: "check-circle-outline", color: "#22C55E", route: "/screen/Tabs/habitos" },
  { id: "4", label: "Agenda", icon: "calendar-clock", color: "#F59E0B", route: "/screen/Tabs/agendamentos" },
];

const RECOMMENDATIONS: RecommendationItem[] = [
  { id: "1", title: "Dormir bem faz bem", subtitle: "Dica da semana", icon: "sleep", color: "#8B5CF6" },
  { id: "2", title: "Hidratação em dia", subtitle: "Meta diária", icon: "water", color: "#0073E6" },
  { id: "3", title: "10 min de meditação", subtitle: "Saúde mental", icon: "meditation", color: "#10B981" },
];

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [dailyMission, setDailyMission] = useState<Mission | null>(null);
  const [iotData, setIotData] = useState<IoTData>(iotService.getLastReading());
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleIoTUpdate = useCallback(async (data: IoTData) => {
    setIotData(data);
    const missions = await missionsService.updateWaterProgress(data.waterIntake);
    const water = missions.find((m) => m.id === "1") ?? null;
    setDailyMission(water);
  }, []);

  const handleRealtimeEvent = useCallback(
    async (event: RealtimeEvent) => {
      if (event.type === "iot-data") {
        await handleIoTUpdate(event.payload as unknown as IoTData);
      }
    },
    [handleIoTUpdate],
  );

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);

        const missions = await missionsService.getMissions();
        const water = missions.find((m) => m.id === "1") ?? null;
        setDailyMission(water);

        await notificationsService.requestPermissions();
        await notificationsService.scheduleDailyReminder();
      } catch (err) {
        console.error("Erro ao inicializar home:", err);
      } finally {
        setLoading(false);
      }
    };

    init();

    realtimeService.connect();
    realtimeService.onConnectionChange(setRealtimeConnected);
    realtimeService.on("iot-data", handleRealtimeEvent);
    realtimeService.on("mission-update", handleRealtimeEvent);

    const stopPolling = iotService.startPolling(handleIoTUpdate, 15000);

    return () => {
      realtimeService.off("iot-data", handleRealtimeEvent);
      realtimeService.off("mission-update", handleRealtimeEvent);
      realtimeService.offConnectionChange(setRealtimeConnected);
      stopPolling();
    };
  }, [handleIoTUpdate, handleRealtimeEvent]);

  const progressPercent = dailyMission
    ? Math.min((dailyMission.current / dailyMission.target) * 100, 100)
    : 60;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#005EBB" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header azul */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>
              Olá, {user?.name?.split(" ")[0] ?? "Usuário"}! 👋
            </Text>
            <Text style={styles.subgreeting}>Que bom te ver por aqui.</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => router.push("/screen/Tabs/agendamentos")}
          >
            <Ionicons name="notifications-outline" color="#FFFFFF" size={24} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Card missão do dia — flutua sobre o body */}
        <View style={styles.missionCard}>
          <Text style={styles.missionCardLabel}>Missão do dia</Text>
          <View style={styles.missionRow}>
            <View style={styles.missionIconWrap}>
              <MaterialCommunityIcons name="water" color="#0073E6" size={26} />
            </View>
            <View style={styles.missionInfo}>
              <Text style={styles.missionName}>
                {dailyMission?.title ?? "Beba 2 litros de água"}
              </Text>
              <Text style={styles.missionProgress}>
                {dailyMission?.current ?? iotData.waterIntake} /{" "}
                {dailyMission?.target ?? 2} {dailyMission?.unit ?? "L"}
              </Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercent}%` as `${number}%` },
                  ]}
                />
              </View>
            </View>
            <View
              style={[
                styles.missionCheck,
                dailyMission?.status === MissionStatus.COMPLETED &&
                  styles.missionCheckDone,
              ]}
            >
              <MaterialCommunityIcons
                name="check"
                color={
                  dailyMission?.status === MissionStatus.COMPLETED
                    ? "#FFFFFF"
                    : "#0073E6"
                }
                size={16}
              />
            </View>
          </View>
          <View style={styles.iotBadge}>
            <MaterialCommunityIcons
              name="bluetooth-connect"
              color={realtimeConnected ? "#0073E6" : "#94A3B8"}
              size={12}
            />
            <Text
              style={[
                styles.iotText,
                { color: realtimeConnected ? "#0073E6" : "#94A3B8" },
              ]}
            >
              {realtimeConnected ? "Sensor conectado" : "Conectando sensor..."}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {/* Continue sua jornada */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue sua jornada</Text>
            <TouchableOpacity onPress={() => router.push("/screen/Tabs/missoes")}>
              <Text style={styles.seeAll}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={QUICK_ACCESS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.quickList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.quickCard}
                onPress={() => router.push(item.route as never)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.quickIconWrap,
                    { backgroundColor: `${item.color}1A` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon as never}
                    color={item.color}
                    size={24}
                  />
                </View>
                <Text style={styles.quickLabel}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Banner motivacional */}
        <View style={styles.motivBanner}>
          <View style={styles.motivTextWrap}>
            <Text style={styles.motivTitle}>
              Pequenas escolhas,{"\n"}grandes transformações.
            </Text>
            <Text style={styles.motivSub}>Você está no caminho certo!</Text>
          </View>
          <MaterialCommunityIcons
            name="flag-checkered"
            color="#FFFFFF"
            size={52}
            style={{ opacity: 0.9 }}
          />
        </View>

        {/* Stats do sensor IoT */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="walk" color="#22C55E" size={20} />
            <Text style={styles.statValue}>{iotData.steps.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Passos</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="heart-pulse" color="#EF4444" size={20} />
            <Text style={styles.statValue}>{iotData.heartRate}</Text>
            <Text style={styles.statLabel}>BPM</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="water" color="#0073E6" size={20} />
            <Text style={styles.statValue}>{iotData.waterIntake}L</Text>
            <Text style={styles.statLabel}>Água</Text>
          </View>
        </View>

        {/* Recomendado para você */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recomendado para você</Text>
          <FlatList
            data={RECOMMENDATIONS}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.recCard} activeOpacity={0.8}>
                <View
                  style={[
                    styles.recIconWrap,
                    { backgroundColor: `${item.color}1A` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon as never}
                    color={item.color}
                    size={22}
                  />
                </View>
                <View style={styles.recText}>
                  <Text style={styles.recTitle}>{item.title}</Text>
                  <Text style={styles.recSub}>{item.subtitle}</Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  color="#94A3B8"
                  size={20}
                />
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </ScrollView>
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
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  greeting: { fontSize: 22, fontWeight: "700", color: "#FFFFFF" },
  subgreeting: { fontSize: 13, color: "#B3D4F5", marginTop: 2 },
  notificationBtn: { padding: 6, position: "relative" },
  notificationDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#005EBB",
  },

  missionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  missionCardLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  missionRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  missionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E6F0FA",
    justifyContent: "center",
    alignItems: "center",
  },
  missionInfo: { flex: 1 },
  missionName: { fontSize: 14, fontWeight: "600", color: "#1A1F2B" },
  missionProgress: { fontSize: 12, color: "#64748B", marginTop: 2 },
  progressBarBg: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    marginTop: 6,
    overflow: "hidden",
  },
  progressBarFill: { height: 6, backgroundColor: "#0073E6", borderRadius: 3 },
  missionCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#0073E6",
    justifyContent: "center",
    alignItems: "center",
  },
  missionCheckDone: { backgroundColor: "#0073E6", borderColor: "#0073E6" },
  iotBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  iotText: { fontSize: 11 },

  body: { paddingTop: 24, paddingHorizontal: 20, paddingBottom: 24 },

  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1A1F2B" },
  seeAll: { fontSize: 13, fontWeight: "600", color: "#0073E6" },

  quickList: { gap: 12, paddingRight: 4 },
  quickCard: { alignItems: "center", gap: 8, width: 76 },
  quickIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1A1F2B",
    textAlign: "center",
  },

  motivBanner: {
    backgroundColor: "#0073E6",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  motivTextWrap: { flex: 1 },
  motivTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 22,
  },
  motivSub: { fontSize: 12, color: "#B3D4F5", marginTop: 4 },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
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
  statValue: { fontSize: 18, fontWeight: "700", color: "#1A1F2B" },
  statLabel: { fontSize: 11, color: "#64748B" },

  recCard: {
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
  recIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  recText: { flex: 1 },
  recTitle: { fontSize: 14, fontWeight: "600", color: "#1A1F2B" },
  recSub: { fontSize: 12, color: "#64748B", marginTop: 2 },
});
