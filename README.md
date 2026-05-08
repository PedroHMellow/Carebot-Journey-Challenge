# Carebot Journey — Mobile Development & IoT

Aplicativo mobile de saúde e bem-estar desenvolvido com **React Native + Expo**, focado em incentivar hábitos saudáveis, acompanhar missões diárias e integrar dados de sensores IoT em tempo real.

---
Integrantes
- rm553187 - Gabriel Borba
- rm553842 - Gustavo Gouvêa Soares
- rm553945 - Henrique Rafael Gomes de Souza
- rm554223 - Pedro Henrique Mello Silva Alves
---

## Como executar

```bash
# 1. Instalar dependências
cd mobile
npm install

# 2. Iniciar o servidor de desenvolvimento
npx expo start

# 3. Limpar cache (se necessário)
npx expo start -c
```

Abra o **Expo Go** no seu celular e escaneie o QR Code.

**Credenciais de teste:**
- Email: `teste@email.com`
- Senha: `123456`

---

## Telas

| Tela | Descrição |
|------|-----------|
| Entrada | Splash screen de boas-vindas |
| Login | Autenticação com validação de formulário |
| Cadastro | Registro de novo usuário |
| Home | Dashboard principal com missão do dia e dados IoT |
| Missões | Progresso, XP, nível e lista de missões semanais |
| Hábitos | Histórico semanal de hábitos com consistência |
| Agendamentos | Consultas agendadas com lembretes por notificação |
| Perfil | Dados do usuário, estatísticas e configurações |

Link pra Demonstração: 
[text](https://youtube.com/shorts/vSyAzmTzPso)

---

## Tecnologias

- **React Native 0.81** + **Expo SDK 54**
- **TypeScript 5.9** (strict mode)
- **Expo Router** (file-based routing)
- **NativeWind v4** (Tailwind CSS para React Native)
- **AsyncStorage** (persistência local)
- **expo-notifications** (notificações push nativas)
- **expo-device** (detecção de dispositivo físico)

---

## Funcionalidades — Sprint 3

### Estrutura e TypeScript
- Pastas organizadas: `screens`, `service`, `components`, `types`
- TypeScript strict sem `any` implícito
- Interfaces: `Mission`, `UserProgress`, `Habit`, `Appointment`, `IoTData`
- Enums: `MissionStatus`, `MissionFrequency`, `HabitCategory`

### Telas e Navegação
- 8 telas com navegação Stack + Tabs (5 abas)
- Componentes nativos: `FlatList`, `ScrollView`, `TextInput`, `Image`
- Formulários com validação de e-mail (regex) e senha
- Feedback visual: loading, erro (Alert), sucesso

### Gerenciamento de Estado
- `useState` e `useEffect` tipados em todas as telas
- Estado reflete ações em tempo real (toggle de missões/hábitos)
- Fluxo de autenticação completo com redirecionamento

### Persistência Local
- AsyncStorage para sessão do usuário (`@current_user`)
- AsyncStorage para missões (`@carebot_missions`)
- AsyncStorage para progresso (`@carebot_progress`)
- AsyncStorage para hábitos (`@carebot_habits`)
- Dados sobrevivem ao fechamento do app

---

## Funcionalidades — Sprint 4

### Comunicação em Tempo Real (WebSocket)
- `RealtimeService` com padrão EventEmitter simulando WebSocket
- Conecta ao iniciar a tela Home e desconecta ao sair
- Emite eventos: `iot-data`, `mission-update`, `achievement`, `notification`
- A UI da Home e Missões se atualiza automaticamente ao receber eventos

### Funcionalidade Nativa — Notificações Push
- Integração com **`expo-notifications`**
- Solicita permissão ao usuário na inicialização
- Envia notificação ao concluir uma missão
- Envia notificação ao subir de nível
- Agenda lembretes diários (09:00 e 20:00)
- Trata recusa de permissão com mensagem orientativa
- Canal Android configurado (`carebot-missions`)

**Permissões necessárias (Android):**
```xml
<!-- Adicionadas automaticamente pelo expo-notifications -->
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
<uses-permission android:name="android.permission.VIBRATE"/>
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```

### Integração IoT — HTTP para Sensores
- `IotService` simula sensores via **HTTP POST** para endpoint IoT
- Polling a cada 15 segundos para novos dados do sensor
- Dados coletados: intake de água (L), passos, frequência cardíaca (BPM)
- A missão "Beber 2 litros de água" é atualizada automaticamente com os dados do sensor
- Indicador de conexão na tela Home ("Sensor conectado")

### UI/UX e Segurança
- Design consistente em todas as telas (paleta Care Plus / Bupa)
- Estados tratados: loading, vazio, erro, sucesso em todas as telas
- Sem credenciais expostas no código
- Logout limpa sessão, notificações e desconecta o serviço em tempo real

---

## Paleta de Cores

| Token | Hex | Uso |
|-------|-----|-----|
| Primary | `#005EBB` | Headers, botões principais |
| Secondary | `#0073E6` | Ícones, links, progress bars |
| Background | `#F8FAFC` | Fundo das telas |
| Surface | `#FFFFFF` | Cards |
| Text Dark | `#1A1F2B` | Títulos |
| Text Muted | `#64748B` | Subtítulos e labels |
| Success | `#22C55E` | Missões concluídas |
| Warning | `#F59E0B` | Streaks, alertas |
| Error | `#EF4444` | Erros, logout |
