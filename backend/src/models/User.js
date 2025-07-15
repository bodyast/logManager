const db = require('../database/db');
const bcrypt = require('bcrypt');

class User {
  // Створення нового користувача
  static async create(userData) {
    const { username, email, password } = userData;
    
    // Хешування паролю
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const [id] = await db('users').insert({
      username,
      email,
      password: hashedPassword
    });
    
    return this.findById(id);
  }
  
  // Пошук користувача за ID
  static async findById(id) {
    return db('users').where({ id }).first();
  }
  
  // Пошук користувача за email
  static async findByEmail(email) {
    return db('users').where({ email }).first();
  }
  
  // Пошук користувача за username
  static async findByUsername(username) {
    return db('users').where({ username }).first();
  }
  
  // Перевірка правильності паролю
  static async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password);
  }
  
  // Оновлення користувача
  static async update(id, userData) {
    const { username, email, password } = userData;
    const updateData = {};
    
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    await db('users').where({ id }).update(updateData);
    return this.findById(id);
  }
  
  // Видалення користувача
  static async delete(id) {
    return db('users').where({ id }).del();
  }
}

module.exports = User;
