import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

const USERS_DB_KEY = "carebot_users_db";

// Inicializar banco de dados com usuários de exemplo
const initDatabase = async () => {
  try {
    const existingDB = await AsyncStorage.getItem(USERS_DB_KEY);
    if (!existingDB) {
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
  } catch (error) {
    console.log("Erro ao inicializar DB:", error);
  }
};

// Obter todos os usuários
const getAllUsers = async (): Promise<User[]> => {
  try {
    await initDatabase();
    const db = await AsyncStorage.getItem(USERS_DB_KEY);
    if (db) {
      const parsed = JSON.parse(db);
      return parsed.users || [];
    }
    return [];
  } catch (error) {
    console.log("Erro ao obter usuários:", error);
    return [];
  }
};

// Verificar se email já existe
const emailExists = async (email: string): Promise<boolean> => {
  const users = await getAllUsers();
  return users.some((user) => user.email === email);
};

// Fazer login
const login = async (
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const users = await getAllUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
      return { success: false, error: "Usuário não encontrado" };
    }

    if (user.password !== password) {
      return { success: false, error: "Senha incorreta" };
    }

    // Salvar sessão
    await AsyncStorage.setItem("currentUser", JSON.stringify(user));
    await AsyncStorage.setItem("userEmail", email);

    return { success: true, user };
  } catch (error) {
    return { success: false, error: "Erro ao realizar login" };
  }
};

// Registrar novo usuário
const register = async (
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    // Validações
    if (!email || !password || !name) {
      return { success: false, error: "Todos os campos são obrigatórios" };
    }

    if (password.length < 6) {
      return { success: false, error: "Senha deve ter no mínimo 6 caracteres" };
    }

    const exists = await emailExists(email);
    if (exists) {
      return { success: false, error: "Este e-mail já está registrado" };
    }

    // Criar novo usuário
    const newUser: User = {
      id: Date.now().toString(),
      email,
      password,
      name,
      createdAt: new Date().toISOString(),
    };

    // Adicionar ao banco de dados
    const users = await getAllUsers();
    users.push(newUser);

    const db = {
      users,
    };

    await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(db));

    // Salvar sessão
    await AsyncStorage.setItem("currentUser", JSON.stringify(newUser));
    await AsyncStorage.setItem("userEmail", email);

    return { success: true, user: newUser };
  } catch (error) {
    return { success: false, error: "Erro ao registrar usuário" };
  }
};

// Fazer logout
const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("currentUser");
    await AsyncStorage.removeItem("userEmail");
  } catch (error) {
    console.log("Erro ao fazer logout:", error);
  }
};

// Obter usuário atual
const getCurrentUser = async (): Promise<User | null> => {
  try {
    const user = await AsyncStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.log("Erro ao obter usuário atual:", error);
    return null;
  }
};

export const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  getAllUsers,
  emailExists,
};
