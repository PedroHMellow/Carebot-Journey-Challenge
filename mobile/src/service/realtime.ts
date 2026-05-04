import { RealtimeEvent, RealtimeEventType } from '../types';

type EventListener = (event: RealtimeEvent) => void;

class RealtimeService {
  private listeners: Map<string, EventListener[]> = new Map();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private connected: boolean = false;
  private connectionCallbacks: Array<(connected: boolean) => void> = [];

  connect(): void {
    if (this.connected) return;
    this.connected = true;

    setTimeout(() => {
      this.notifyConnectionChange(true);
      this.emit({
        type: 'notification',
        payload: { message: 'Conectado ao servidor Carebot em tempo real' },
        timestamp: Date.now(),
      });
    }, 500);

    this.intervalId = setInterval(() => {
      this.simulateServerEvent();
    }, 10000);
  }

  disconnect(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.connected = false;
    this.notifyConnectionChange(false);
  }

  onConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionCallbacks.push(callback);
  }

  offConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionCallbacks = this.connectionCallbacks.filter((c) => c !== callback);
  }

  on(eventType: RealtimeEventType | '*', listener: EventListener): void {
    const key = eventType;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key)!.push(listener);
  }

  off(eventType: RealtimeEventType | '*', listener: EventListener): void {
    const key = eventType;
    const current = this.listeners.get(key) ?? [];
    this.listeners.set(key, current.filter((l) => l !== listener));
  }

  isConnected(): boolean {
    return this.connected;
  }

  private emit(event: RealtimeEvent): void {
    const specific = this.listeners.get(event.type) ?? [];
    specific.forEach((listener) => listener(event));

    const all = this.listeners.get('*') ?? [];
    all.forEach((listener) => listener(event));
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionCallbacks.forEach((cb) => cb(connected));
  }

  private simulateServerEvent(): void {
    const roll = Math.random();

    if (roll < 0.4) {
      const intake = parseFloat((Math.random() * 0.3 + 0.1).toFixed(1));
      this.emit({
        type: 'iot-data',
        payload: {
          deviceId: 'smart-bottle-001',
          waterIntake: intake,
          steps: Math.floor(Math.random() * 500 + 100),
          heartRate: Math.floor(Math.random() * 20 + 65),
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
      });
    } else if (roll < 0.7) {
      this.emit({
        type: 'mission-update',
        payload: {
          missionId: '1',
          delta: parseFloat((Math.random() * 0.2 + 0.05).toFixed(2)),
        },
        timestamp: Date.now(),
      });
    } else {
      const messages = [
        'Você está na direção certa! Continue assim.',
        'Mais um passo para completar sua missão!',
        'Lembre-se de se hidratar hoje.',
        'Ótimo progresso! Continue sua jornada.',
      ];
      this.emit({
        type: 'achievement',
        payload: {
          message: messages[Math.floor(Math.random() * messages.length)],
        },
        timestamp: Date.now(),
      });
    }
  }
}

export const realtimeService = new RealtimeService();
