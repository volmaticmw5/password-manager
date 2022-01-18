import * as config from './config'
const axios = require('axios')
import UserData from './udata';

export default class cSync
{
    delay = 1000
    isValid = false
    firstBoot = true

    constructor(_delay)
    {
        this.delay = _delay
    }

    Validate()
    {
        const syncer = this
        const settings = config.GetSyncSettings()
        axios.get(settings.hostname + '/api/ping').then(function(response){
            let body = response.data
            if(response.status === 200 && body)
            {
                axios.post(settings.hostname + '/api/auth', {
                    username: settings.username,
                    password: config.getMasterPassword()
                }).then(function(response){
                    body = response.data
                    if(body.type === 'error')
                        syncer.setValid(false)
                    else
                        syncer.setValid(true)
                })
            }else{
                syncer.setValid(false)
            }
        }).catch(function(error) {
            syncer.setValid(false)
            console.log('Error while trying to send a GET request: ' + error)
        }).then(function(){ })
    }

    setValid(_value)
    {
        this.isValid = _value
    }

    Sync()
    {
        if(!this.isValid)
            return

        const udata = new UserData()
        const settings = config.GetSyncSettings()

        if(this.firstBoot)
        {
            console.log('First boot, sync enabled, ignoring local files and fetching newest data from the database.')

            axios.post(settings.hostname + '/api/get', {
                username: settings.username,
                password: config.getMasterPassword()
            }).then(function(response){
                let body = response.data
                if(body.type != 'error')
                {
                    if(body.data.length > 0)
                    {
                        console.log('Populate (forced) user data with provided api data.')
                        udata.ForceUpdateData(body.data)
                    }
                }
            })
            
            this.firstBoot = false
        }
        else
        {
            if(udata.FileExists())
                udata.ReadUserData()

            axios.post(settings.hostname + '/api/sync', {
                username: settings.username,
                password: config.getMasterPassword(),
                data: JSON.stringify(udata.GetData())
            }).then(function(response){
                let body = response.data
                if(body.newData.length > 0)
                {
                    udata.ForceUpdateData(body.newData)
                }
            })

            setTimeout(() => {
                this.Sync()
            }, 1000);
        }
    }
}

module.exports.cSync = cSync
