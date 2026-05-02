import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

const USERS_DB_KEY = "@carebot_users_db";
const CURRENT_USER_KEY = "@current_user";

// Inicializar banco fake
const initDatabase = async () => {
  const existing = await AsyncStorage.getItem(USERS_DB_KEY);

  if (!existing) {
    const initialDB = {
      users: [
        {
          id: "1",
          email: "teste@email.com",
          password: "123456",
          name: "Usuário Teste",
          createdAt: new Date().toISOString(),
        },
      ],
    };

    await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(initialDB));
  }
};

// Buscar usuários
const getAllUsers = async (): Promise<User[]> => {
  await initDatabase();

  const db = await AsyncStorage.getItem(USERS_DB_KEY);
  if (!db) return [];

  return JSON.parse(db).users || [];
};

// Login
const login = async (email: string, password: string) => {
  const users = await getAllUsers();

  const user = users.find((u) => u.email === email);

  if (!user) {
    return { success: false, error: "Usuário não encontrado" };
  }

  if (user.password !== password) {
    return { success: false, error: "Senha incorreta" };
  }

  // 🔥 salva sessão (PADRONIZADO)
  await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

  return { success: true, user };
};

// Registro
const register = async (email: string, password: string, name: string) => {
  const users = await getAllUsers();

  if (!email || !password || !name) {
    return { success: false, error: "Preencha todos os campos" };
  }

  if (password.length < 6) {
    return { success: false, error: "Senha muito curta" };
  }

  const exists = users.some((u) => u.email === email);
  if (exists) {
    return { success: false, error: "Email já existe" };
  }

  const newUser: User = {
    id: Date.now().toString(),
    email,
    password,
    name,
    createdAt: new Date().toISOString(),
  };

  const updated = [...users, newUser];

  await AsyncStorage.setItem(
    USERS_DB_KEY,
    JSON.stringify({ users: updated })
  );

  // 🔥 login automático após cadastro
  await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

  return { success: true, user: newUser };
};

// Logout
const logout = async () => {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
};

// Pegar usuário logado
const getCurrentUser = async (): Promise<User | null> => {
  const user = await AsyncStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

// Verificar se está logado
const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return !!user;
};

export const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated,
};