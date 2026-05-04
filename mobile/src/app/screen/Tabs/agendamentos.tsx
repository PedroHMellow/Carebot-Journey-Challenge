import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { notificationsService } from "../../../service/notifications";
import { Appointment } from "../../../types";

const APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    title: "Consulta com nutricionista",
    date: "24 de Maio",
    time: "10:00",
    professional: "Dra. Ana Lima",
    type: "Nutrição",
    location: "Clínica Saúde Total",
  },
  {
    id: "2",
    title: "Retorno cardiologista",
    date: "30 de Maio",
    time: "14:30",
    professional: "Dr. Carlos Mota",
    type: "Cardiologia",
    location: "Hospital São Lucas",
  },
  {
    id: "3",
    title: "Sessão de fisioterapia",
    date: "2 de Junho",
    time: "09:00",
    professional: "Dr. Paulo Souza",
    type: "Fisioterapia",
    location: "Centro Terapêutico",
  },
  {
    id: "4",
    title: "Check-up anual",
    date: "15 de Junho",
    time: "08:00",
    professional: "Dr. Roberto Neves",
    type: "Clínica Geral",
    location: "UBS Central",
  },
];

const TYPE_COLORS: Record<string, string> = {
  Nutrição: "#10B981",
  Cardiologia: "#EF4444",
  Fisioterapia: "#0073E6",
  "Clínica Geral": "#8B5CF6",
};

export default function Agendamentos() {
  const handleReminder = async (appointment: Appointment) => {
    try {
      const hasPermission = await notificationsService.requestPermissions();

      if (!hasPermission) {
        Alert.alert(
          "Permissão necessária",
          "Ative as notificações nas configurações do dispositivo para receber lembretes.",
        );
        return;
      }

      Alert.alert(
        "Lembrete Ativado",
        `Você será notificado sobre: ${appointment.title} em ${appointment.date} às ${appointment.time}.`,
        [{ text: "OK" }],
      );
    } catch {
      Alert.alert("Erro", "Não foi possível configurar o lembrete.");
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={APPOINTMENTS}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Agendamentos</Text>
            <Text style={styles.headerSub}>
              Suas próximas consultas e compromissos
            </Text>

            {/* Banner */}
            <View style={styles.bannerCard}>
              <MaterialCommunityIcons name="calendar-check" color="#0073E6" size={28} />
              <View style={styles.bannerText}>
                <Text style={styles.bannerTitle}>Próxima consulta</Text>
                <Text style={styles.bannerSub}>
                  Nutricionista — 24 de Maio, 10:00
                </Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const color = TYPE_COLORS[item.type] ?? "#005EBB";

          return (
            <View style={styles.appointCard}>
              <View style={styles.appointLeft}>
                <View
                  style={[
                    styles.appointIconWrap,
                    { backgroundColor: `${color}1A` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="stethoscope"
                    color={color}
                    size={22}
                  />
                </View>
                <View
                  style={[styles.typeBadge, { backgroundColor: `${color}1A` }]}
                >
                  <Text style={[styles.typeText, { color }]}>{item.type}</Text>
                </View>
              </View>

              <View style={styles.appointInfo}>
                <Text style={styles.appointTitle}>{item.title}</Text>
                <Text style={styles.appointPro}>{item.professional}</Text>
                <View style={styles.appointMeta}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    color="#94A3B8"
                    size={12}
                  />
                  <Text style={styles.appointMetaText}>{item.location}</Text>
                </View>
                <View style={styles.appointDate}>
                  <MaterialCommunityIcons
                    name="calendar-outline"
                    color="#0073E6"
                    size={14}
                  />
                  <Text style={styles.appointDateText}>
                    {item.date}, {item.time}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.reminderBtn}
                onPress={() => handleReminder(item)}
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons
                  name="bell-outline"
                  color="#005EBB"
                  size={20}
                />
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="calendar-blank-outline"
              color="#94A3B8"
              size={48}
            />
            <Text style={styles.emptyText}>Nenhum agendamento encontrado.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    backgroundColor: "#005EBB",
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  headerSub: { fontSize: 13, color: "#B3D4F5", marginTop: 4, marginBottom: 20 },

  bannerCard: {
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
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: 14, fontWeight: "700", color: "#1A1F2B" },
  bannerSub: { fontSize: 13, color: "#64748B", marginTop: 2 },

  listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },

  appointCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  appointLeft: { alignItems: "center", gap: 8 },
  appointIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  typeBadge: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  typeText: { fontSize: 10, fontWeight: "700" },

  appointInfo: { flex: 1 },
  appointTitle: { fontSize: 14, fontWeight: "600", color: "#1A1F2B" },
  appointPro: { fontSize: 12, color: "#64748B", marginTop: 2 },
  appointMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  appointMetaText: { fontSize: 11, color: "#94A3B8" },
  appointDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  appointDateText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0073E6",
  },

  reminderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E6F0FA",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },

  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: { fontSize: 15, color: "#94A3B8" },
});
