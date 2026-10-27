const mysql = require('mysql2/promise');

async function main() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'olms_user',
        password: 'N!th@2007',
        database: 'olms_db'
    });

    try {
        const [rows] = await connection.execute('SHOW CREATE TABLE discussions;');
        console.log(rows[0]['Create Table']);
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

main().catch(console.error);
