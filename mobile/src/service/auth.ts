import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface StoredUser extends User {
  password: string;
}

const USERS_DB_KEY = "@carebot_users_db";
const CURRENT_USER_KEY = "carebot_current_user";

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

const getAllUsers = async (): Promise<StoredUser[]> => {
  await initDatabase();
  const db = await AsyncStorage.getItem(USERS_DB_KEY);
  if (!db) return [];
  return JSON.parse(db).users || [];
};

const toPublicUser = (u: StoredUser): User => ({
  id: u.id,
  email: u.email,
  name: u.name,
  createdAt: u.createdAt,
});

const login = async (email: string, password: string) => {
  const users = await getAllUsers();
  const user = users.find((u) => u.email === email);

  if (!user) return { success: false, error: "Usuário não encontrado" };
  if (user.password !== password) return { success: false, error: "Senha incorreta" };

  const publicUser = toPublicUser(user);
  await SecureStore.setItemAsync(CURRENT_USER_KEY, JSON.stringify(publicUser));

  return { success: true, user: publicUser };
};

const register = async (email: string, password: string, name: string) => {
  const users = await getAllUsers();

  if (!email || !password || !name)
    return { success: false, error: "Preencha todos os campos" };
  if (password.length < 6)
    return { success: false, error: "Senha muito curta" };

  const exists = users.some((u) => u.email === email);
  if (exists) return { success: false, error: "Email já existe" };

  const newUser: StoredUser = {
    id: Date.now().toString(),
    email,
    password,
    name,
    createdAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    USERS_DB_KEY,
    JSON.stringify({ users: [...users, newUser] })
  );

  const publicUser = toPublicUser(newUser);
  await SecureStore.setItemAsync(CURRENT_USER_KEY, JSON.stringify(publicUser));

  return { success: true, user: publicUser };
};

const logout = async () => {
  await SecureStore.deleteItemAsync(CURRENT_USER_KEY);
};

const getCurrentUser = async (): Promise<User | null> => {
  const user = await SecureStore.getItemAsync(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

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
