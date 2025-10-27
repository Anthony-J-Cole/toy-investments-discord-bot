import mysql2 from 'mysql2/promise'
import env from 'dotenv/config'


const config = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'pf2e_investments'
}


const db = await mysql2.createConnection(config);

export default db
//Create query using const [results, fields] = await db.query(query, [fields])