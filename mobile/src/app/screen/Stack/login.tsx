import { Text, View, ScrollView, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { authService } from "../../../service/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkIfLoggedIn();
  }, []);

  const checkIfLoggedIn = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        router.replace("/screen/Tabs/home");
      }
    } catch (error) {
      console.log("Erro ao verificar login:", error);
    }
  };

  const validateEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Erro", "Por favor, insira um e-mail válido");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const result = await authService.login(email, password);

      if (result.success) {
        Alert.alert("Sucesso", "Login realizado com sucesso!");
        router.replace("/screen/Tabs/home");
      } else {
        Alert.alert("Erro", result.error || "Falha ao realizar login");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao realizar login. Tente novamente.");
      console.log("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert("Recuperar Senha", "Funcionalidade em desenvolvimento");
  };

  const handleSignUp = () => {
    router.push("/screen/Stack/signup");
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-16 pb-10">
        {/* Logo */}
        <View className="mb-8 items-center">
          <Image
            source={require("../../../assets/images/Carebot Journey Logo.png")}
            className="h-56 w-56"
            resizeMode="contain"
          />
        </View>

        {/* Welcome Text */}
        <View className="mb-8 justify-center items-center">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo de volta!
          </Text>
          <Text className="text-sm text-gray-600 text-center">
            Faça login para continuar sua jornada em direção a uma vida mais saudável.
          </Text>
        </View>

        {/* Email Input */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">E-mail</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-900"
            placeholder="seu@email.com"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!loading}
          />
        </View>

        {/* Password Input */}
        <View className="mb-2">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Senha</Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-4 py-3">
            <TextInput
              className="flex-1 text-gray-900"
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text className="text-blue-600 font-semibold text-sm">
                {showPassword ? "Ocultar" : "Ver"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity onPress={handleForgotPassword} className="mb-6">
          <Text className="text-center text-blue-600 text-sm font-semibold">
            Esqueceu sua senha?
          </Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className={`rounded-lg py-3 mb-6 ${
            loading ? "bg-blue-400" : "bg-blue-600"
          }`}
        >
          <Text className="text-center text-white font-bold text-lg">
            {loading ? "Entrando..." : "Entrar"}
          </Text>
        </TouchableOpacity>

        {/* Sign Up */}
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600 text-sm">Ainda não tem conta? </Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text className="text-blue-600 font-semibold text-sm">Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}