import {
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { authService } from "../../../service/auth";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    if (name.trim().length < 3) {
      Alert.alert("Erro", "Nome deve ter no mínimo 3 caracteres");
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

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }

    setLoading(true);
    try {
      const result = await authService.register(email, password, name);

      if (result.success) {
        Alert.alert("Sucesso", "Conta criada com sucesso!", [
          {
            text: "OK",
            onPress: () => router.replace("/screen/Tabs/home"),
          },
        ]);
      } else {
        Alert.alert("Erro", result.error || "Falha ao criar conta");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao criar conta. Tente novamente.");
      console.log("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-12 pb-10">
        {/* Back Button */}
        <TouchableOpacity onPress={handleBackToLogin} className="mb-6">
          <Text className="text-blue-600 font-semibold text-base">← Voltar</Text>
        </TouchableOpacity>

        {/* Logo */}
        <View className="mb-6 items-center">
          <Image
            source={require("../../../assets/images/Carebot Journey Logo.png")}
            className="h-40 w-56"
            resizeMode="contain"
          />
        </View>

        {/* Welcome Text */}
        <View className="mb-8 justify-center items-center">
          <Text className="text-2xl font-bold text-gray-900 mb-2">Criar Conta</Text>
          <Text className="text-sm text-gray-600 text-center">
            Junte-se a nós e comece sua jornada para uma vida mais saudável
          </Text>
        </View>

        {/* Name Input */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Nome</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-900"
            placeholder="Seu nome completo"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />
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
        <View className="mb-4">
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

        {/* Confirm Password Input */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Confirmar Senha
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-4 py-3">
            <TextInput
              className="flex-1 text-gray-900"
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Text className="text-blue-600 font-semibold text-sm">
                {showConfirmPassword ? "Ocultar" : "Ver"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          onPress={handleSignUp}
          disabled={loading}
          className={`rounded-lg py-3 mb-6 ${
            loading ? "bg-blue-400" : "bg-blue-600"
          }`}
        >
          <Text className="text-center text-white font-bold text-lg">
            {loading ? "Criando conta..." : "Criar Conta"}
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600 text-sm">Já tem conta? </Text>
          <TouchableOpacity onPress={handleBackToLogin}>
            <Text className="text-blue-600 font-semibold text-sm">Fazer login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
