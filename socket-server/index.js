const { Server } = require('socket.io');

const io = new Server({
  cors: {
    origin: '*',
  },
});

const generateIoTData = () => ({
  deviceId: 'smart-bottle-001',
  waterIntake: parseFloat((Math.random() * 2).toFixed(1)),
  steps: Math.floor(Math.random() * 2000 + 2000),
  heartRate: Math.floor(Math.random() * 30 + 65),
  timestamp: Date.now(),
});

const generateMissionUpdate = () => ({
  missionId: '1',
  delta: parseFloat((Math.random() * 0.2 + 0.1).toFixed(2)),
  timestamp: Date.now(),
});

const generateAchievement = () => ({
  message: 'Missão concluída! Continue assim!',
  timestamp: Date.now(),
});

io.on('connection', (socket) => {
  console.log(`Socket conectado: ${socket.id}`);

  socket.emit('notification', {
    message: 'Conexão Socket.IO estabelecida com Carebot!',
    timestamp: Date.now(),
  });

  const sendPeriodicEvents = () => {
    socket.emit('iot-data', generateIoTData());
    socket.emit('mission-update', generateMissionUpdate());
    if (Math.random() < 0.35) {
      socket.emit('achievement', generateAchievement());
    }
  };

  const intervalId = setInterval(sendPeriodicEvents, 10000);

  socket.on('client-ping', () => {
    socket.emit('server-pong', { timestamp: Date.now() });
  });

  socket.on('disconnect', () => {
    clearInterval(intervalId);
    console.log(`Socket desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
io.listen(PORT);
console.log(`Socket.IO server rodando em http://localhost:${PORT}`);
