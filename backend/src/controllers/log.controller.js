const LogPath = require('../models/LogPath');
const Server = require('../models/Server');
const { Client } = require('ssh2');

// Отримання вмісту лог-файлу (останні N рядків)
exports.getLogContent = async (req, res) => {
  try {
    const { logPathId } = req.params;
    const { lines = 100 } = req.query;
    
    // Знаходження шляху до логу
    const logPath = await LogPath.findById(logPathId);
    if (!logPath) {
      return res.status(404).json({
        status: 'error',
        message: 'Шлях до логу не знайдено'
      });
    }
    
    // Перевірка прав доступу до сервера
    const server = await Server.findById(logPath.server_id);
    if (server.user_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'У вас немає доступу до цього сервера'
      });
    }
    
    // Підключення до сервера через SSH
    const ssh = new Client();
    
    try {
      // Підготовка параметрів підключення
      const connectConfig = {
        host: server.host,
        port: server.port,
        username: server.username
      };
      
      // Додавання методу аутентифікації
      if (server.private_key) {
        connectConfig.privateKey = server.private_key;
        
        if (server.private_key_passphrase) {
          connectConfig.passphrase = server.private_key_passphrase;
        }
      } else if (server.password) {
        connectConfig.password = server.password;
      } else {
        return res.status(400).json({
          status: 'error',
          message: 'Не вказано пароль або приватний ключ для підключення'
        });
      }
      
      // Виконання команди для отримання останніх N рядків лог-файлу
      const logContent = await new Promise((resolve, reject) => {
        ssh.on('ready', () => {
          ssh.exec(`tail -n ${lines} ${logPath.path}`, (err, stream) => {
            if (err) {
              ssh.end();
              return reject(err);
            }
            
            let data = '';
            stream.on('data', (chunk) => {
              data += chunk;
            });
            
            stream.on('end', () => {
              ssh.end();
              resolve(data);
            });
            
            stream.stderr.on('data', (data) => {
              reject(data.toString());
            });
          });
        }).on('error', (err) => {
          reject(err);
        }).connect(connectConfig);
      });
      
      res.status(200).json({
        status: 'success',
        data: {
          content: logContent,
          logPath: {
            id: logPath.id,
            name: logPath.name,
            path: logPath.path
          },
          server: {
            id: server.id,
            name: server.name,
            host: server.host
          }
        }
      });
    } catch (sshError) {
      res.status(500).json({
        status: 'error',
        message: `Помилка підключення до сервера або отримання логу: ${sshError.message}`
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Помилка отримання вмісту логу: ' + error.message
    });
  }
};

// Перевірка доступності лог-файлу
exports.checkLogFile = async (req, res) => {
  try {
    const { logPathId } = req.params;
    
    // Знаходження шляху до логу
    const logPath = await LogPath.findById(logPathId);
    if (!logPath) {
      return res.status(404).json({
        status: 'error',
        message: 'Шлях до логу не знайдено'
      });
    }
    
    // Перевірка прав доступу до сервера
    const server = await Server.findById(logPath.server_id);
    if (server.user_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'У вас немає доступу до цього сервера'
      });
    }
    
    // Підключення до сервера через SSH
    const ssh = new Client();
    
    try {
      // Підготовка параметрів підключення
      const connectConfig = {
        host: server.host,
        port: server.port,
        username: server.username
      };
      
      // Додавання методу аутентифікації
      if (server.private_key) {
        connectConfig.privateKey = server.private_key;
        
        if (server.private_key_passphrase) {
          connectConfig.passphrase = server.private_key_passphrase;
        }
      } else if (server.password) {
        connectConfig.password = server.password;
      } else {
        return res.status(400).json({
          status: 'error',
          message: 'Не вказано пароль або приватний ключ для підключення'
        });
      }
      
      // Перевірка наявності файлу
      const result = await new Promise((resolve, reject) => {
        ssh.on('ready', () => {
          ssh.exec(`test -f ${logPath.path} && echo "exists" || echo "not_exists"`, (err, stream) => {
            if (err) {
              ssh.end();
              return reject(err);
            }
            
            let data = '';
            stream.on('data', (chunk) => {
              data += chunk;
            });
            
            stream.on('end', () => {
              ssh.end();
              resolve(data.trim());
            });
            
            stream.stderr.on('data', (data) => {
              reject(data.toString());
            });
          });
        }).on('error', (err) => {
          reject(err);
        }).connect(connectConfig);
      });
      
      const exists = result === 'exists';
      
      res.status(200).json({
        status: 'success',
        data: {
          exists,
          logPath: {
            id: logPath.id,
            name: logPath.name,
            path: logPath.path
          }
        }
      });
    } catch (sshError) {
      res.status(500).json({
        status: 'error',
        message: `Помилка підключення до сервера або перевірки файлу: ${sshError.message}`
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Помилка перевірки доступності лог-файлу: ' + error.message
    });
  }
};
