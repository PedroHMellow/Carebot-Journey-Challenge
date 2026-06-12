import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import { RealtimeEvent, RealtimeEventType } from '../types';

type EventListener = (event: RealtimeEvent) => void;

const SOCKET_SERVER_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:4000'
    : 'http://localhost:4000';

class RealtimeService {
  private listeners: Map<string, EventListener[]> = new Map();
  private socket: Socket | null = null;
  private connected: boolean = false;
  private connectionCallbacks: Array<(connected: boolean) => void> = [];

  connect(): void {
    if (this.socket?.connected) return;

    if (!this.socket) {
      this.socket = io(SOCKET_SERVER_URL, {
        transports: ['websocket'],
        autoConnect: false,
      });

      this.socket.on('connect', () => {
        this.connected = true;
        this.notifyConnectionChange(true);
        this.emit({
          type: 'notification',
          payload: { message: 'Conectado ao servidor Socket.IO' },
          timestamp: Date.now(),
        });
      });

      this.socket.on('disconnect', () => {
        this.connected = false;
        this.notifyConnectionChange(false);
        this.emit({
          type: 'notification',
          payload: { message: 'Desconectado do servidor Socket.IO' },
          timestamp: Date.now(),
        });
      });

      this.socket.on('connect_error', () => {
        this.connected = false;
        this.notifyConnectionChange(false);
      });

      this.socket.on('iot-data', (payload) => {
        this.emit({
          type: 'iot-data',
          payload: payload as Record<string, unknown>,
          timestamp: Date.now(),
        });
      });

      this.socket.on('mission-update', (payload) => {
        this.emit({
          type: 'mission-update',
          payload: payload as Record<string, unknown>,
          timestamp: Date.now(),
        });
      });

      this.socket.on('achievement', (payload) => {
        this.emit({
          type: 'achievement',
          payload: payload as Record<string, unknown>,
          timestamp: Date.now(),
        });
      });

      this.socket.on('notification', (payload) => {
        this.emit({
          type: 'notification',
          payload: payload as Record<string, unknown>,
          timestamp: Date.now(),
        });
      });
    }

    this.socket.connect();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
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
}

export const realtimeService = new RealtimeService();
