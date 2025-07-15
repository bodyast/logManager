const { validationResult } = require('express-validator');
const LogPath = require('../models/LogPath');
const Server = require('../models/Server');

// Отримання всіх шляхів до логів для конкретного сервера
exports.getLogPaths = async (req, res) => {
  try {
    const serverId = req.params.serverId;
    
    // Перевірка існування сервера та прав доступу
    const server = await Server.findById(serverId);
    if (!server) {
      return res.status(404).json({
        status: 'error',
        message: 'Сервер не знайдено'
      });
    }
    
    if (server.user_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'У вас немає доступу до цього сервера'
      });
    }
    
    // Отримання шляхів до логів
    const logPaths = await LogPath.findByServerId(serverId);
    
    res.status(200).json({
      status: 'success',
      results: logPaths.length,
      data: {
        logPaths
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Помилка отримання шляхів до логів: ' + error.message
    });
  }
};

// Отримання всіх шляхів до логів користувача (з усіх серверів)
exports.getAllUserLogPaths = async (req, res) => {
  try {
    const logPaths = await LogPath.findByUserId(req.user.id);
    
    res.status(200).json({
      status: 'success',
      results: logPaths.length,
      data: {
        logPaths
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Помилка отримання шляхів до логів: ' + error.message
    });
  }
};

// Отримання конкретного шляху до логу
exports.getLogPath = async (req, res) => {
  try {
    const logPath = await LogPath.findById(req.params.id);
    
    if (!logPath) {
      return res.status(404).json({
        status: 'error',
        message: 'Шлях до логу не знайдено'
      });
    }
    
    // Перевірка прав доступу
    const server = await Server.findById(logPath.server_id);
    if (server.user_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'У вас немає доступу до цього шляху до логу'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        logPath
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Помилка отримання шляху до логу: ' + error.message
    });
  }
};

// Створення нового шляху до логу
exports.createLogPath = async (req, res) => {
  try {
    // Перевірка помилок валідації
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }
    
    const { serverId } = req.params;
    const { name, path, description } = req.body;
    
    // Перевірка існування сервера та прав доступу
    const server = await Server.findById(serverId);
    if (!server) {
      return res.status(404).json({
        status: 'error',
        message: 'Сервер не знайдено'
      });
    }
    
    if (server.user_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'У вас немає доступу до цього сервера'
      });
    }
    
    // Створення нового шляху до логу
    const newLogPath = await LogPath.create({
      server_id: serverId,
      name,
      path,
      description
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        logPath: newLogPath
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Помилка створення шляху до логу: ' + error.message
    });
  }
};

// Оновлення шляху до логу
exports.updateLogPath = async (req, res) => {
  try {
    const logPath = await LogPath.findById(req.params.id);
    
    if (!logPath) {
      return res.status(404).json({
        status: 'error',
        message: 'Шлях до логу не знайдено'
      });
    }
    
    // Перевірка прав доступу
    const server = await Server.findById(logPath.server_id);
    if (server.user_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'У вас немає доступу до цього шляху до логу'
      });
    }
    
    // Оновлення шляху до логу
    const updatedLogPath = await LogPath.update(req.params.id, req.body);
    
    res.status(200).json({
      status: 'success',
      data: {
        logPath: updatedLogPath
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Помилка оновлення шляху до логу: ' + error.message
    });
  }
};

// Видалення шляху до логу
exports.deleteLogPath = async (req, res) => {
  try {
    const logPath = await LogPath.findById(req.params.id);
    
    if (!logPath) {
      return res.status(404).json({
        status: 'error',
        message: 'Шлях до логу не знайдено'
      });
    }
    
    // Перевірка прав доступу
    const server = await Server.findById(logPath.server_id);
    if (server.user_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'У вас немає доступу до цього шляху до логу'
      });
    }
    
    // Видалення шляху до логу
    await LogPath.delete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Помилка видалення шляху до логу: ' + error.message
    });
  }
};
