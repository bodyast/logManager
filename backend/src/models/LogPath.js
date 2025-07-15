const db = require('../database/db');

class LogPath {
  // Створення нового шляху до логу
  static async create(logPathData) {
    const { server_id, name, path, description } = logPathData;
    
    const [id] = await db('log_paths').insert({
      server_id,
      name,
      path,
      description
    });
    
    return this.findById(id);
  }
  
  // Отримання шляхів до логів сервера
  static async findByServerId(serverId) {
    return db('log_paths').where({ server_id: serverId });
  }
  
  // Пошук шляху до логу за ID
  static async findById(id) {
    return db('log_paths').where({ id }).first();
  }
  
  // Оновлення шляху до логу
  static async update(id, logPathData) {
    const { name, path, description } = logPathData;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (path) updateData.path = path;
    if (description !== undefined) updateData.description = description;
    
    await db('log_paths').where({ id }).update(updateData);
    return this.findById(id);
  }
  
  // Видалення шляху до логу
  static async delete(id) {
    return db('log_paths').where({ id }).del();
  }
  
  // Отримання шляхів до логів користувача
  static async findByUserId(userId) {
    return db('log_paths')
      .join('servers', 'log_paths.server_id', 'servers.id')
      .where('servers.user_id', userId)
      .select('log_paths.*', 'servers.name as server_name');
  }
}

module.exports = LogPath;
