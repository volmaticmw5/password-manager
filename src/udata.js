const fs = require('fs')
const electron = require('electron')
const crypto = require('crypto')
const { encrypt, decrypt } = require('./crypt');
import * as config from './config'
const userDataPath = (electron.app || electron.remote.app).getPath('userData')+'/udata.json';

export default class UserData
{
    userDataObj = [];

    constructor() {
    }

    GetData()
    {
        return this.userDataObj
    }

    FileExists()
    {
        return fs.existsSync(userDataPath)
    }

    WriteUserData()
    {
        try{
            let jsonString = JSON.stringify(this.userDataObj)
            fs.writeFileSync(userDataPath, jsonString)
            return true
        }catch(e){
            return false
        }
    }

    ReadUserData()
    {
        if(!this.FileExists())
        {
            return false
        }

        let serialized = fs.readFileSync(userDataPath)
        let deserialized = JSON.parse(serialized)
        this.userDataObj = deserialized

        return true
    }

    GetPasswordFromId(id)
    {
        let master = config.getMasterPassword()
        for(let i = 0; i < this.userDataObj.length; i++)
        {
            if(this.userDataObj[i].type == "password" && this.userDataObj[i].id == id)
                return decrypt(master, this.userDataObj[i].password)
        }
    }
}

module.exports.UserData = UserData