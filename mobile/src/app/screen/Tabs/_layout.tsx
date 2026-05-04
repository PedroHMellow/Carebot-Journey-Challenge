import "../../../styles/global.css";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";

function CenterTabButton(props: BottomTabBarButtonProps) {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={styles.centerButton}
      activeOpacity={0.85}
    >
      <View style={styles.centerButtonInner}>
        <MaterialCommunityIcons name="plus" color="#FFFFFF" size={28} />
      </View>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#005EBB",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="missoes"
        options={{
          title: "Missões",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="target" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="agendamentos"
        options={{
          title: "",
          tabBarButton: (props) => <CenterTabButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="habitos"
        options={{
          title: "Hábitos",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="check-circle-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashbord"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopColor: "#E2E8F0",
    borderTopWidth: 1,
    height: 70,
    paddingTop: 6,
    paddingBottom: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  centerButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerButtonInner: {
    backgroundColor: "#005EBB",
    borderRadius: 32,
    width: 58,
    height: 58,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    elevation: 8,
    shadowColor: "#005EBB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
