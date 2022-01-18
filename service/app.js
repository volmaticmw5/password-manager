const express = require('express')
const http = require('http')
const config = require('./config')
const crypto = require('crypto')
const bodyParser = require('body-parser')
const { Database } = require('./database')
const { deserialize } = require('v8')

const [,, ...args] = process.argv
const app = express()
app.use(bodyParser.json())

if(args[0] == "create_user")
{
    if(!args[1] && !args[2])
    {
        console.log('You need to specify a username and a password')
        return
    }

    console.log('Creating user "'+ args[1] +'" with password "'+ args[2] +'"')
    let db = new Database()
    let dbConnRes = db.Connect()

    if(!dbConnRes)
    {
        console.log('Failed to create user: database connection could not be established.')
        return
    }

    db.connection.query("INSERT INTO users (`username`,`master`) VALUES (?, ?)", [
        args[1],
        crypto.createHmac('sha256', 'salty').update(args[2]).digest('hex')
    ], function(error, results){
        if(error)
        {
            console.log(error)
            return
        }

        console.log('User created successfully, bye!')
        return
    })

    return
}

app.get('/', (req, res) => {
    res.send('It works!')
})

// Just make sure the database is working
app.get('/api/ping', (req, res) => {
    let db = new Database()
    let dbConnRes = db.Connect()
    res.send({message: "Pong", result: dbConnRes})
})

app.post('/api/get', (req, res) => {
    let db = new Database()
    let dbConnRes = db.Connect()
    if(!dbConnRes)
    {
        res.send({type: 'error', msg: 'Database connection failed on the server, please try again later.'})
        return
    }

    db.connection.query("SELECT * FROM users WHERE `username`=? AND `master`=? LIMIT 1", [
        req.body.username,
        req.body.password
    ], function(errors, rows){
        if(errors)
        {
            console.log(errors)
            res.send({type: 'error', msg: 'Failed to validate user, bye.'})
            return
        }
        
        if(rows.length == 0)
        {
            res.send({type: 'error', msg: 'Failed to validate user, bye.'})
            return
        }

        let uid = rows[0].id
        db.connection.query("SELECT `data` FROM data WHERE `owner`=? LIMIT 1", [uid], function(errors, rows){
            if(errors)
            {
                console.log(errors)
                res.send({type: 'error', msg: 'Failed to find user data, bye'})
                return
            }

            if(rows[0].data == null){
                console.log(errors)
                res.send({type: 'error', msg: 'Failed to find user data, bye'})
                return
            }

            res.send({type: 'success', data: rows[0].data})
        })
    })
})

// Sync request
// Get the database results and check (with the ids) for outdated and/or missing user data
// If there's for e.g. a missing password we'll insert it into the database
// After all the syncing is done, return a big ass object with all our NEW user data 
app.post('/api/sync', (req, res) => {
    let db = new Database()
    let dbConnRes = db.Connect()
    if(!dbConnRes)
    {
        res.send({type: 'error', msg: 'Database connection failed on the server, please try again later.'})
        return
    }

    let data = req.body
    
    db.connection.query("SELECT `id` FROM users WHERE `username`=? AND `master`=? LIMIT 1", [
        data.username,
        data.password
    ], function(errors, result){
        if(errors)
        {
            console.log(errors)
            return
        }

        if(!result[0])
        {
            console.log('Failed to authenticate user ' + data.username)
            return
        }

        let uid = result[0].id
        db.connection.query("SELECT * FROM data WHERE `owner`=? LIMIT 1", [uid], function(error, rows){
            if(error)
            {
                console.log(error)
                return
            }

            if(rows.length == 0)
            {
                // There's no db entries for this user, just insert everything
                db.connection.query('INSERT INTO data (`owner`,`data`) VALUES (?, ?)', [
                    uid,
                    data.data
                ], function(error, rows){
                    if(error)
                    {
                        console.log(error)
                        return
                    }
                })
            }
            else
            {
                let deserializedDataFromClient = JSON.parse(data.data)
                let deserializedDataFromDb = JSON.parse(rows[0].data)
                let lastUpdate = rows[0].lastUpdate
                let now = Math.floor(new Date().getTime() / 1000)

                // TODO :: INSERT & DELETE new passwords

                for(let i=0;i < deserializedDataFromDb.length; i++)
                {
                    for(let y=0; y < deserializedDataFromClient.length; y++)
                    {
                        if(deserializedDataFromDb[i].id == deserializedDataFromClient[y].id)
                        {
                            if(deserializedDataFromClient[y].password.content != deserializedDataFromDb[i].password.content)
                            {
                                console.log('Missmatch user data: ' + deserializedDataFromDb[i].name)

                                if(lastUpdate + 1000 < now || lastUpdate == null)
                                {
                                    // Our data is newer than the one in the database, update it
                                    console.log('Updating data "'+ deserializedDataFromClient[y].name +'"')
                                    deserializedDataFromDb[i].password = deserializedDataFromClient[y].password
                                    db.connection.query("UPDATE data SET `data`=?, last_update=? WHERE `owner`=?", [
                                        JSON.stringify(deserializedDataFromDb),
                                        now,
                                        uid
                                    ], function(errors, rows){ if(error) console.log(error)})
                                }
                            }
                        }
                    }
                }

                // We're done updating the database, send the client our database data
                res.send({
                    newData: JSON.stringify(deserializedDataFromDb)
                })
            }
        })
    })
})

// Validate authentication
app.post('/api/auth', (req, res) => {
    let db = new Database()
    let dbConnRes = db.Connect()
    if(!dbConnRes)
    {
        res.send({type: 'error', msg: 'Database connection failed on the server, please try again later.'})
        return
    }

    db.connection.query("SELECT COUNT(*) as count FROM users WHERE username=? LIMIT 1", [req.body.username], function(error, results){
        if(error){
            res.send({type: 'error', msg: 'Query syntax error, please check the service process.'})
            return
        }

        if(results[0].count == 0)
        {
            res.send({type: 'error', msg:'This username doesnt exist.'})
            return
        }
        else
        {
            console.log('Validating username "'+ req.body.username +'"')

            db.connection.query("SELECT COUNT(*) as count FROM users WHERE `username`=? AND `master`=? LIMIT 1", [
                req.body.username,
                req.body.password
            ], function(errors, results){
                if(error){
                    console.log('Failed to validate user, got an error while getting the count of users with this username "'+ req.body.username +'"')
                    res.send({type: 'error', msg: 'Failed to validate user, please check the service process.'})
                    return
                }

                if(results[0].count == 0){
                    console.log('Failed to validate user. This password is invalid.')
                    res.send({type: 'error', msg: 'This master password does not match the records in this service.'})
                }else{
                    console.log('Successfully validated user "'+ req.body.username +'"')
                    res.send({type: 'success', msg: 'User exists and was validated.'})
                }
            })
        }
    })
})

app.listen(config.port, config.address, () => {
    console.log('Service API has been started! Listening on ' + config.address + ':' + config.port)
})

