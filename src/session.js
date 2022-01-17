const crypto = require('crypto')
import * as config from './config'

export default class cSession
{
    isAuthenticated = false

    constructor()
    {
        this.isAuthenticated = false
    }

    Login(password)
    {
        if(password)
        {
            let encPassword = crypto.createHmac('sha256', 'salty').update(password).digest('hex');
            if(encPassword === config.getMasterPassword())
            {
                this.isAuthenticated = true

                return {
                    result: true,
                    message: "Success!"
                };
            }
            else
            {
                return {
                    result: false,
                    message: "This password doesn't seem to be correct, please try again!"
                };
            }
        }
        else
        {
            return {
                result: false,
                message: "This password doesn't seem valid, please try again!"
            };
        }
    }
}

module.exports.cSession = cSession