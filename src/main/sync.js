import { ipcMain } from 'electron';
const crypto = require('crypto');
const axios = require('axios')
const config = require('./../config');

ipcMain.on('SyncSettingsUpdate', (event, arg) => {
    let encPassword = crypto.createHmac('sha256', 'salty').update(arg.password).digest('hex');
    if(encPassword === config.getMasterPassword())
    {
        config.UpdateSyncSettings(arg.hostname, arg.username)
        event.sender.send('SyncUpdateSucc', {})
    }
    else
    {
        event.sender.send('SyncUpdateFailed', {msg: "Your master password doesn't seem to be correct!"})
    }
});

ipcMain.on('LoadSyncSettings', (event, args) => {
    event.sender.send('LoadSyncSettings', config.GetSyncSettings())
})

ipcMain.on('TrySyncConnect', (event, args) => {
    let encPassword = crypto.createHmac('sha256', 'salty').update(args.password).digest('hex');
    if(encPassword === config.getMasterPassword())
    {
        console.log('Validating sync settings with hostname ' + args.hostname)

        axios.get(args.hostname + '/api/ping').then(function(response){
            let body = response.data
            if(response.status === 200 && body)
            {
                if(body.result)
                    event.sender.send('SyncMessageUpdate', {msg: 'Host seems valid, trying to authenticate...'})
                else
                    return
    
                // Try to authenticate
                axios.post(args.hostname + '/api/auth', {
                    username: args.username,
                    password: encPassword
                }).then(function(response){
                    body = response.data
                    if(body.type === 'error')
                        event.sender.send('SyncTryFailed', {msg: "Error: " + body.msg})
                    else
                        event.sender.send('SyncMessageUpdate', {msg: '<font color="green">These settings are valid!</font>'}) 
                })
            }else{
                event.sender.send('SyncTryFailed', {msg: 'This host is not accepting our requests, please check that first.'})
            }
        }).catch(function(error) {
            console.log('Error while trying to send a GET request: ' + error)
            event.sender.send('SyncTryFailed', {msg: 'This hostname does not seem to be valid, please check if its correct.</br>You might need to specify a port as well.'})
        }).then(function(){ })
    }
    else
    {
        event.sender.send('SyncUpdateFailed', {msg: "Your master password doesn't seem to be correct!"})
    }
})