import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { authService, User } from "../../../service/auth";
import { missionsService } from "../../../service/missions";
import { notificationsService } from "../../../service/notifications";
import { realtimeService } from "../../../service/realtime";
import { UserProgress } from "../../../types";

interface MenuItemProps {
  icon: string;
  label: string;
  sublabel?: string;
  color?: string;
  onPress: () => void;
  danger?: boolean;
}

function MenuItem({ icon, label, sublabel, color = "#005EBB", onPress, danger }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.menuIconWrap, { backgroundColor: danger ? "#FEE2E2" : `${color}1A` }]}>
        <MaterialCommunityIcons
          name={icon as never}
          color={danger ? "#EF4444" : color}
          size={20}
        />
      </View>
      <View style={styles.menuText}>
        <Text style={[styles.menuLabel, danger && { color: "#EF4444" }]}>{label}</Text>
        {sublabel && <Text style={styles.menuSublabel}>{sublabel}</Text>}
      </View>
      {!danger && (
        <MaterialCommunityIcons name="chevron-right" color="#94A3B8" size={20} />
      )}
    </TouchableOpacity>
  );
}

export default function Perfil() {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const loadData = useCallback(async () => {
    try {
      const [currentUser, prog] = await Promise.all([
        authService.getCurrentUser(),
        missionsService.getProgress(),
      ]);
      setUser(currentUser);
      setProgress(prog);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar o perfil.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = () => {
    Alert.alert(
      "Sair da conta",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            setLoggingOut(true);
            try {
              realtimeService.disconnect();
              await notificationsService.cancelAll();
              await authService.logout();
              router.replace("/screen/Stack/login");
            } catch {
              Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
              setLoggingOut(false);
            }
          },
        },
      ],
    );
  };

  const handleNotifications = async () => {
    const granted = await notificationsService.requestPermissions();
    if (granted) {
      await notificationsService.scheduleDailyReminder();
      Alert.alert("Sucesso", "Lembretes diários ativados para 09:00 e 20:00.");
    } else {
      Alert.alert(
        "Permissão negada",
        "Ative as notificações nas configurações do dispositivo.",
      );
    }
  };

  const xpPercent = progress
    ? Math.min((progress.currentXP / progress.targetXP) * 100, 100)
    : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#005EBB" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <MaterialCommunityIcons name="account-circle" color="#FFFFFF" size={72} />
          <TouchableOpacity style={styles.avatarEdit}>
            <MaterialCommunityIcons name="camera" color="#005EBB" size={16} />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{user?.name ?? "Usuário"}</Text>
        <Text style={styles.userEmail}>{user?.email ?? ""}</Text>

        {progress && (
          <View style={styles.levelPill}>
            <Text style={styles.levelPillText}>
              Nível {progress.level} • {progress.levelTitle}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        {/* XP e progresso */}
        {progress && (
          <View style={styles.xpCard}>
            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>Experiência</Text>
              <Text style={styles.xpValue}>
                {progress.currentXP} / {progress.targetXP} XP
              </Text>
            </View>
            <View style={styles.xpBarBg}>
              <View
                style={[
                  styles.xpBarFill,
                  { width: `${xpPercent}%` as `${number}%` },
                ]}
              />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="fire" color="#F59E0B" size={18} />
                <Text style={styles.statValue}>{progress.streak}</Text>
                <Text style={styles.statLabel}>Sequência</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="trophy" color="#0073E6" size={18} />
                <Text style={styles.statValue}>{progress.completedMissions}</Text>
                <Text style={styles.statLabel}>Missões</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="chart-line" color="#22C55E" size={18} />
                <Text style={styles.statValue}>{progress.weeklyProgress}%</Text>
                <Text style={styles.statLabel}>Semanal</Text>
              </View>
            </View>
          </View>
        )}

        {/* Menu de configurações */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Conta</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="account-edit-outline"
              label="Editar perfil"
              sublabel="Nome e informações pessoais"
              onPress={() =>
                Alert.alert("Em breve", "Edição de perfil em desenvolvimento.")
              }
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="bell-outline"
              label="Notificações"
              sublabel="Lembretes diários e alertas"
              onPress={handleNotifications}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="shield-check-outline"
              label="Privacidade e segurança"
              onPress={() =>
                Alert.alert("Em breve", "Configurações de privacidade em desenvolvimento.")
              }
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Suporte</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="help-circle-outline"
              label="Central de ajuda"
              onPress={() =>
                Alert.alert("Ajuda", "Acesse carebot.com/ajuda para suporte.")
              }
              color="#8B5CF6"
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="information-outline"
              label="Sobre o Carebot Journey"
              sublabel="Versão 1.0.0"
              onPress={() =>
                Alert.alert(
                  "Carebot Journey",
                  "Sprint 3 & 4 — Mobile Development & IoT",
                )
              }
              color="#10B981"
            />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.menuCard}>
          {loggingOut ? (
            <View style={styles.logoutLoading}>
              <ActivityIndicator size="small" color="#EF4444" />
              <Text style={styles.logoutLoadingText}>Saindo...</Text>
            </View>
          ) : (
            <MenuItem
              icon="logout"
              label="Sair da conta"
              onPress={handleLogout}
              danger
            />
          )}
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
    paddingBottom: 32,
    alignItems: "center",
  },
  avatarWrap: { position: "relative", marginBottom: 12 },
  avatarEdit: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: { fontSize: 20, fontWeight: "700", color: "#FFFFFF" },
  userEmail: { fontSize: 13, color: "#B3D4F5", marginTop: 4 },
  levelPill: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 10,
  },
  levelPillText: { fontSize: 12, fontWeight: "600", color: "#FFFFFF" },

  body: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },

  xpCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  xpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  xpLabel: { fontSize: 13, fontWeight: "600", color: "#1A1F2B" },
  xpValue: { fontSize: 13, color: "#64748B" },
  xpBarBg: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  xpBarFill: { height: 8, backgroundColor: "#005EBB", borderRadius: 4 },

  statsRow: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center", gap: 4 },
  statValue: { fontSize: 18, fontWeight: "700", color: "#1A1F2B" },
  statLabel: { fontSize: 11, color: "#64748B" },
  statDivider: { width: 1, height: "100%", backgroundColor: "#E2E8F0" },

  menuSection: { marginBottom: 16 },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: "600", color: "#1A1F2B" },
  menuSublabel: { fontSize: 12, color: "#64748B", marginTop: 2 },
  menuDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 66,
  },

  logoutLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 10,
  },
  logoutLoadingText: { fontSize: 14, color: "#EF4444" },
});
