import { Text, View, ScrollView } from "react-native";
import Header from "../../../components/Header";

export default function home() {
  return (
    // 1. Usamos a View como container principal para segurar tudo
    <View className="flex-1 bg-white">
      
      {/* 2. Chamada correta do componente (self-closing tag) */}
      <Header userName="Pedro" />

      {/* 3. O restante do seu conteúdo */}
      <View className="flex-1 items-center justify-center">
        <Text className="text-4xl text-purple-700 font-bold"> 
           Dashbord !!! 
        </Text>
      </View>

    </View>
  );
}