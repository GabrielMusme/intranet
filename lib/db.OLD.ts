import mysql, { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

// Se crea una función que recibe el nombre de la base de datos
// y retorna un pool de conexiones
const dbPool = (db: string) => mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: db,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
  export default dbPool;
  export type { RowDataPacket, ResultSetHeader };

  // Si se necesita hacer transacciones se puede hacer de la siguiente manera:
  // import dbPoll from './db';
  // const connection = await dbPool.getConnection();
  // await connection.beginTransaction();
  // try {
  //   await connection.query('INSERT INTO table SET ?', { name: 'test' });
  //   await connection.commit();
  // } catch (err) {
  //   await connection.rollback();
  //   throw err;
  // } finally {
  //   connection.release(); ---> Esto es importante para liberar la conexión
  // }



  export function getUserByEmail(email: string) {
    return dbPool("Prueba3").execute<RowDataPacket[]>(
      "SELECT id, email, password_hash, name, role, is_active FROM members WHERE email = ?",
      [email]
    ).then(([rows]) => rows[0] as (RowDataPacket & { id: number; email: string; password_hash: string; name: string; role: string; is_active: boolean }) || null);
  }