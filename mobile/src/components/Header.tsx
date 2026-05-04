import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// --- Types & Interfaces ---

interface MissionData {
  title: string;
  description: string;
  currentValue: number;
  goalValue: number;
  unit: string;
}

interface HeaderProps {
  userName?: string;
}

// --- Constants / Enums ---
// Centralizando cores para facilitar manutenção futura
enum HeaderColors {
  PRIMARY_BLUE = "#005EBB",
  CARD_WHITE = "#FFFFFF",
  ICON_LIGHT_BLUE = "#E0F2FE",
  TEXT_DARK = "#1E293B",
  PROGRESS_BG = "#F1F5F9",
}

export default function Header({ userName = "Pedro" }: HeaderProps) {
  
  // Exemplo de estado que viria de um service/api futuramente
  const dailyMission: MissionData = {
    title: "Missão do dia",
    description: "Beba 2 litros de água",
    currentValue: 1.2,
    goalValue: 2,
    unit: "L",
  };

  // Cálculo de progresso para a barra (em porcentagem)
  const progressPercentage = `${(dailyMission.currentValue / dailyMission.goalValue) * 100}%` as `${number}%`;

  return (
    <View 
      className="pt-14 pb-8 px-6 rounded-b-[40px]" 
      style={{ backgroundColor: HeaderColors.PRIMARY_BLUE }}
    >
      {/* 1 & 2: Saudação e Nome do Usuário */}
      <View className="flex-row justify-between items-start mb-8">
        <View>
          <Text className="text-white text-2xl font-bold leading-tight">
            Olá, {userName}! 👋
          </Text>
          <Text className="text-white/80 text-base">
            Que bom te ver por aqui.
          </Text>
        </View>

        <TouchableOpacity 
          activeOpacity={0.7}
          className="p-2 bg-white/10 rounded-full"
        >
          <Ionicons name="notifications-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* 3: Card de Missão Diária */}
      <View 
        className="bg-white p-5 rounded-3xl shadow-sm"
        style={{ elevation: 4 }} // Sombra para Android
      >
        <Text 
          className="font-bold text-base mb-4"
          style={{ color: HeaderColors.TEXT_DARK }}
        >
          {dailyMission.title}
        </Text>

        <View className="flex-row items-center">
          {/* Ícone da Missão */}
          <View 
            className="w-12 h-12 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: HeaderColors.ICON_LIGHT_BLUE }}
          >
            <MaterialCommunityIcons 
              name="water" 
              size={26} 
              color={HeaderColors.PRIMARY_BLUE} 
            />
          </View>

          {/* Info e Progresso */}
          <View className="flex-1">
            <Text className="text-sm font-semibold text-slate-700">
              {dailyMission.description}
            </Text>
            <Text className="text-xs text-slate-400 mb-2">
              {dailyMission.currentValue} / {dailyMission.goalValue} {dailyMission.unit}
            </Text>
            
            {/* Barra de Progresso Customizada */}
            <View 
              className="h-2 w-full rounded-full overflow-hidden"
              style={{ backgroundColor: HeaderColors.PROGRESS_BG }}
            >
              <View 
                className="h-full rounded-full"
                style={{ 
                  backgroundColor: HeaderColors.PRIMARY_BLUE, 
                  width: progressPercentage 
                }}
              />
            </View>
          </View>

          {/* Status Check */}
          <View className="ml-4 border-2 border-blue-100 rounded-full p-1">
            <Ionicons name="checkmark" size={18} color={HeaderColors.PRIMARY_BLUE} />
          </View>
        </View>
      </View>
    </View>
  );
}