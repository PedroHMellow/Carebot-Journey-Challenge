import {
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { authService } from "../../../service/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) router.replace("/screen/Tabs/home");
      } catch {
        // ignore
      }
    };
    check();
  }, [router]);

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setEmailError("O e-mail é obrigatório.");
      return false;
    }
    if (!EMAIL_REGEX.test(value)) {
      setEmailError("Insira um e-mail válido.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleLogin = async () => {
    const emailOk = validateEmail(email);
    if (!emailOk) return;

    if (!password.trim()) {
      Alert.alert("Campo obrigatório", "Por favor, insira sua senha.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Senha inválida", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const result = await authService.login(email.trim().toLowerCase(), password);
      if (result.success) {
        router.replace("/screen/Tabs/home");
      } else {
        Alert.alert("Erro ao entrar", result.error ?? "Credenciais inválidas.");
        setLoading(false);
      }
    } catch {
      Alert.alert("Erro", "Falha ao conectar. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Logo */}
      <Image
        source={require("../../../assets/images/Carebot-Journey-Logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Título */}
      <Text style={styles.title}>Bem-vindo de volta!</Text>
      <Text style={styles.subtitle}>
        Faça login para continuar sua jornada em direção a uma vida mais
        saudável.
      </Text>

      {/* Email */}
      <View style={styles.inputWrap}>
        <MaterialCommunityIcons
          name="email-outline"
          color="#94A3B8"
          size={20}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (emailError) validateEmail(v);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
      </View>
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      {/* Senha */}
      <View style={[styles.inputWrap, { marginTop: emailError ? 4 : 12 }]}>
        <MaterialCommunityIcons
          name="lock-outline"
          color="#94A3B8"
          size={20}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#94A3B8"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />
        <TouchableOpacity
          onPress={() => setShowPassword((prev) => !prev)}
          style={styles.eyeBtn}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            color="#94A3B8"
            size={20}
          />
        </TouchableOpacity>
      </View>

      {/* Esqueceu senha */}
      <TouchableOpacity
        style={styles.forgotWrap}
        onPress={() =>
          Alert.alert("Recuperar Senha", "Funcionalidade em desenvolvimento.")
        }
      >
        <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
      </TouchableOpacity>

      {/* Botão entrar */}
      <TouchableOpacity
        style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.loginBtnText}>Entrar</Text>
        )}
      </TouchableOpacity>

      {/* Divisor */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou continue com</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social buttons */}
      <View style={styles.socialRow}>
        <TouchableOpacity
          style={styles.socialBtn}
          onPress={() =>
            Alert.alert("Google", "Login com Google em desenvolvimento.")
          }
        >
          <MaterialCommunityIcons name="google" color="#EA4335" size={20} />
          <Text style={styles.socialBtnText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.socialBtn, styles.socialBtnDark]}
          onPress={() =>
            Alert.alert("Apple", "Login com Apple em desenvolvimento.")
          }
        >
          <MaterialCommunityIcons name="apple" color="#FFFFFF" size={20} />
          <Text style={[styles.socialBtnText, { color: "#FFFFFF" }]}>Apple</Text>
        </TouchableOpacity>
      </View>

      {/* Cadastro */}
      <View style={styles.signupRow}>
        <Text style={styles.signupText}>Ainda não tem conta? </Text>
        <TouchableOpacity onPress={() => router.push("/screen/Stack/signup")}>
          <Text style={styles.signupLink}>Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
  },
  logo: { width: 160, height: 120, marginBottom: 24 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1F2B",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    height: 52,
    width: "100%",
    marginBottom: 0,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: "#1A1F2B" },
  eyeBtn: { padding: 4 },
  errorText: { fontSize: 12, color: "#EF4444", alignSelf: "flex-start", marginTop: 4 },

  forgotWrap: { alignSelf: "flex-end", marginTop: 10, marginBottom: 20 },
  forgotText: { fontSize: 13, color: "#0073E6", fontWeight: "600" },

  loginBtn: {
    backgroundColor: "#005EBB",
    borderRadius: 12,
    height: 52,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#005EBB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginBtnDisabled: { backgroundColor: "#94A3B8", elevation: 0 },
  loginBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E2E8F0" },
  dividerText: { fontSize: 13, color: "#94A3B8" },

  socialRow: { flexDirection: "row", gap: 12, width: "100%", marginBottom: 32 },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    height: 48,
    backgroundColor: "#FFFFFF",
  },
  socialBtnDark: { backgroundColor: "#1A1F2B", borderColor: "#1A1F2B" },
  socialBtnText: { fontSize: 14, fontWeight: "600", color: "#1A1F2B" },

  signupRow: { flexDirection: "row", alignItems: "center" },
  signupText: { fontSize: 14, color: "#64748B" },
  signupLink: { fontSize: 14, fontWeight: "700", color: "#005EBB" },
});
