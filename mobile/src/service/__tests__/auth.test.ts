import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../auth';

describe('authService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should login with valid credentials', async () => {
    const result = await authService.login('teste@email.com', '123456');

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.email).toBe('teste@email.com');
  });

  it('should reject login with incorrect password', async () => {
    const result = await authService.login('teste@email.com', 'wrongpass');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Senha incorreta');
  });

  it('should register a new user and authenticate', async () => {
    const result = await authService.register('novo@email.com', 'abcdef', 'Novo Usuário');

    expect(result.success).toBe(true);
    expect(result.user?.email).toBe('novo@email.com');
    expect(await authService.isAuthenticated()).toBe(true);
  });

  it('should not register with an existing email', async () => {
    await authService.register('teste@email.com', '123456', 'Usuário Teste');
    const result = await authService.register('teste@email.com', '123456', 'Duplicado');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Email já existe');
  });
});
