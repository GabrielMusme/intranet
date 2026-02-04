"use server";

import dbPool, { RowDataPacket } from "@/lib/db";

export interface Grupo extends RowDataPacket {
  grupo_id: number;
  nombre: string;
}

export async function getGrupos() {
  console.log("Execute getGrupos...");
  const cSQL = `
    SELECT id, name, deleted
    FROM researchGroup
    ORDER BY name ASC
  `;
  const intemaPool = dbPool("intraIntema");
  const conn = await intemaPool.getConnection();
  const [grupos] = await conn.execute<Grupo[]>(cSQL, []);
  conn.release();
  return grupos;
}

// Verifica si un valor existe en un campo de una tabla
export async function checkExistCmp(
  table: string,
  cmp: string,
  value: string | number
): Promise<RowDataPacket[] | null> {
  const cSQL = `
    SELECT * 
    FROM ${table}
    WHERE ${cmp} = ${value}
  `;
  console.log("CSQL checkExistCmp: ", cSQL)

  const intemaPool = dbPool("intraIntema");
  const conn = await intemaPool.getConnection();
  const [rows] = await conn.execute<RowDataPacket[]>(cSQL, []);
  conn.release();
  return rows.length >0 ? rows :null;
}
// export {checkExistCmp}
