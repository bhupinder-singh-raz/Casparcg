import DBService from "../services/db.service";

export const context = async () => {
  const db = DBService.getDb();
  return { db };
};
