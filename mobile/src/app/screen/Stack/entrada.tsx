import { View, Text, Image, Pressable } from "react-native";
import { Link } from "expo-router";

export default function entrada() {
  return (
  
    <View className="flex-1 bg-[#E6F0F8] items-center justify-center p-6">
     
      <View className="items-center">
        <Image
          source={require("../../../assets/images/Carebot-Journey-Icon.png")}
          className="h-80 w-80 mb-2" 
        />
      </View>

      {/* 2. Bloco de Texto (Estilo baseado na image_69c4d9.png) */}
      <View className="items-center mt-2">
        <Text className="text-center mb-6">
          <Text className="text-4xl font-extrabold text-[#0D1658] leading-tight">
            Bem-vindo ao{"\n"}Carebot{" "}
          </Text>
          <Text className="text-4xl font-extrabold text-[#3298F2] leading-tight">
            Journey
          </Text>
        </Text>

        <Text className="text-lg text-[#0D1658] text-center font-poppinsBold leading-6 mb-8">
          Pequenas escolhas constroem{"\n"}
          uma vida mais saudável.{"\n"}
        </Text>
      </View>

      {/* 3. Botão de Link Corrigido */}
      <View className="w-full items-center ">
        <Link href="/screen/Stack/login" asChild>
          <Pressable 
            className="bg-[#3298F2] rounded-2xl px-24 py-5 shadow-md active:opacity-70"
          >
            <Text className="text-white font-bold text-xl text-center mx-3.5">
              Continuar
            </Text>
          </Pressable>
        </Link>
      </View>

    </View>
  );
}