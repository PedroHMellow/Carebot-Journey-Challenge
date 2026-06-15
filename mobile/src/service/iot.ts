import { IoTData } from '../types';

const IOT_SENSOR_ENDPOINT = 'https://httpbin.org/post';
const DEVICE_TOKEN = process.env.EXPO_PUBLIC_IOT_DEVICE_TOKEN ?? 'carebot-iot-v1';

let cachedReading: IoTData = {
  deviceId: 'smart-bottle-001',
  waterIntake: 1.2,
  steps: 4823,
  heartRate: 72,
  timestamp: Date.now(),
};

const fetchSensorData = async (): Promise<IoTData> => {
  try {
    const body = JSON.stringify({
      deviceId: 'smart-bottle-001',
      type: 'health-sensor',
      query: 'current-status',
    });

    const response = await fetch(IOT_SENSOR_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Token': DEVICE_TOKEN,
      },
      body,
    });

    if (!response.ok) throw new Error(`Sensor HTTP error: ${response.status}`);

    const newWater = Math.min(2.0, cachedReading.waterIntake + parseFloat((Math.random() * 0.15).toFixed(2)));
    const newSteps = cachedReading.steps + Math.floor(Math.random() * 300 + 50);
    const newHeartRate = Math.floor(Math.random() * 20 + 65);

    cachedReading = {
      deviceId: 'smart-bottle-001',
      waterIntake: parseFloat(newWater.toFixed(1)),
      steps: newSteps,
      heartRate: newHeartRate,
      timestamp: Date.now(),
    };

    return cachedReading;
  } catch {
    return { ...cachedReading, timestamp: Date.now() };
  }
};

const getLastReading = (): IoTData => ({ ...cachedReading });

const setInitialReading = (data: Partial<IoTData>): void => {
  cachedReading = { ...cachedReading, ...data, timestamp: Date.now() };
};

const startPolling = (
  callback: (data: IoTData) => void,
  intervalMs: number = 12000,
): (() => void) => {
  callback(cachedReading);

  const id = setInterval(async () => {
    const data = await fetchSensorData();
    callback(data);
  }, intervalMs);

  return () => clearInterval(id);
};

export const iotService = {
  fetchSensorData,
  getLastReading,
  setInitialReading,
  startPolling,
};
