import { readFile } from 'node:fs/promises';

const schemaUrl = new URL('../sql/001-reservas.sql', import.meta.url);

export async function applySchema(database) {
  const sql = await readFile(schemaUrl, 'utf8');
  await database.query(sql);
}
