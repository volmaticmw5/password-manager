const mysql = require('mysql')
const config = require('./config')

class Database
{
    connection = null

    constructor() {}

    Connect()
    {
        this.connection = mysql.createConnection({
            host: config.mysql.address,
            port: config.mysql.port,
            user: config.mysql.user,
            password: config.mysql.password,
            database: config.mysql.database
        })

        this.connection.connect((err) => {
            if(err) return false;
            return true
        })
        
        return true
    }
}

module.exports.Database = Database
