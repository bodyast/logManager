/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('log_paths', table => {
    table.increments('id').primary();
    table.integer('server_id').unsigned().notNullable();
    table.string('name').notNullable();
    table.string('path').notNullable();
    table.string('description').nullable();
    table.timestamps(true, true);
    
    table.foreign('server_id').references('id').inTable('servers').onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('log_paths');
};
