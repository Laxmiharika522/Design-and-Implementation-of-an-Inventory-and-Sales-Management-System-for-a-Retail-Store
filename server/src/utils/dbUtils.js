// Utility to manually auto-increment Primary Keys in code 
// because AUTO_INCREMENT was removed from the database schema designs.

export const getNextId = async (connectionOrPool, tableName, idColumn) => {
  const [rows] = await connectionOrPool.query(`SELECT IFNULL(MAX(${idColumn}), 0) + 1 AS nextId FROM ${tableName}`);
  return rows[0].nextId;
};
