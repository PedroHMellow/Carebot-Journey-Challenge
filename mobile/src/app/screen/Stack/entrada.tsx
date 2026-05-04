import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Entrada() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/images/Carebot-Journey-Icon.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.textBlock}>
        <Text style={styles.title}>
          Bem-vindo ao Carebot{" "}
          <Text style={styles.titleBlue}>Journey</Text>
        </Text>
        <Text style={styles.subtitle}>
          Pequenas escolhas constroem{"\n"}uma vida mais saudável.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/screen/Stack/login")}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F0F8",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  textBlock: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0D1658",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 42,
  },
  titleBlue: {
    color: "#3298F2",
  },
  subtitle: {
    fontSize: 16,
    color: "#0D1658",
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.75,
  },
  button: {
    backgroundColor: "#005EBB",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 64,
    elevation: 4,
    shadowColor: "#005EBB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
});