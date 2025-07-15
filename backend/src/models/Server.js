const db = require('../database/db');
const CryptoJS = require('crypto-js');

class Server {
  // Шифрування конфіденційних даних
  static encrypt(text) {
    if (!text) return null;
    return CryptoJS.AES.encrypt(text, process.env.ENCRYPTION_KEY).toString();
  }
  
  // Дешифрування конфіденційних даних
  static decrypt(encryptedText) {
    if (!encryptedText) return null;
    const bytes = CryptoJS.AES.decrypt(encryptedText, process.env.ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  
  // Створення нового сервера
  static async create(serverData) {
    const { 
      user_id, 
      name, 
      host, 
      port, 
      username, 
      password, 
      private_key, 
      private_key_passphrase 
    } = serverData;
    
    const [id] = await db('servers').insert({
      user_id,
      name,
      host,
      port: port || 22,
      username,
      password: password ? this.encrypt(password) : null,
      private_key: private_key ? this.encrypt(private_key) : null,
      private_key_passphrase: private_key_passphrase ? this.encrypt(private_key_passphrase) : null
    });
    
    return this.findById(id);
  }
  
  // Отримання серверів користувача
  static async findByUserId(userId) {
    return db('servers').where({ user_id: userId });
  }
  
  // Пошук сервера за ID
  static async findById(id) {
    const server = await db('servers').where({ id }).first();
    
    if (server) {
      // Дешифрування конфіденційних даних
      if (server.password) {
        server.password = this.decrypt(server.password);
      }
      
      if (server.private_key) {
        server.private_key = this.decrypt(server.private_key);
      }
      
      if (server.private_key_passphrase) {
        server.private_key_passphrase = this.decrypt(server.private_key_passphrase);
      }
    }
    
    return server;
  }
  
  // Оновлення сервера
  static async update(id, serverData) {
    const { 
      name, 
      host, 
      port, 
      username, 
      password, 
      private_key, 
      private_key_passphrase 
    } = serverData;
    
    const updateData = {};
    
    if (name) updateData.name = name;
    if (host) updateData.host = host;
    if (port) updateData.port = port;
    if (username) updateData.username = username;
    
    // Шифрування даних, якщо вони передані
    if (password !== undefined) {
      updateData.password = password ? this.encrypt(password) : null;
    }
    
    if (private_key !== undefined) {
      updateData.private_key = private_key ? this.encrypt(private_key) : null;
    }
    
    if (private_key_passphrase !== undefined) {
      updateData.private_key_passphrase = private_key_passphrase ? this.encrypt(private_key_passphrase) : null;
    }
    
    await db('servers').where({ id }).update(updateData);
    return this.findById(id);
  }
  
  // Видалення сервера
  static async delete(id) {
    return db('servers').where({ id }).del();
  }
}

module.exports = Server;
