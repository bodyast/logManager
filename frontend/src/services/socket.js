import { io } from 'socket.io-client';

// Функція для створення нового сокет-з'єднання з токеном авторизації
const createSocketConnection = (token) => {
  const socket = io(process.env.REACT_APP_SOCKET_URL || '', {
    auth: {
      token
    },
    autoConnect: false
  });
  
  // Обробники подій
  socket.on('connect', () => {
    console.log('Socket підключено:', socket.id);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Socket відключено:', reason);
  });
  
  socket.on('connect_error', (error) => {
    console.error('Помилка підключення:', error.message);
  });
  
  return socket;
};

export default createSocketConnection;
