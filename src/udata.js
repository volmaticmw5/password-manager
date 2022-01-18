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

    ExportTo(dir)
    {
        try{
            let jsonString = JSON.stringify(this.userDataObj)
            fs.writeFileSync(dir, jsonString)
            return true
        }catch(e){
            return false
        }
    }

    GetPasswordData(id)
    {
        for(let i = 0; i < this.userDataObj.length; i++)
        {
            if(this.userDataObj[i].type == "password" && this.userDataObj[i].id == id)
            {
                let response = JSON.parse(JSON.stringify(this.userDataObj[i]))
                response.password = decrypt(config.getMasterPassword(), response.password)
                return response
            }
        }
    }

    ImportFrom(dir)
    {
        try{
            console.log('Importing user data from ' + dir)
            let contents = fs.readFileSync(dir)
            let deserialized = JSON.parse(contents)

            for(let i=0;i < deserialized.length;i++)
            {
                if(deserialized[i].type == 'password' || deserialized[i].type == 'note')
                {
                    let idExists = false
                    for(let y = 0; y < this.userDataObj.length; y++)
                    {
                        if(this.userDataObj[y].id == deserialized[i].id)
                        {
                            idExists = true
                            break
                        }
                    }

                    if(!idExists)
                    {
                        console.log('Push new password from import. Id: ' + deserialized[i].id)
                        this.userDataObj.push(deserialized[i])
                    }
                    else
                    {
                        console.log('Skipping import of password #'+ deserialized[i].id + ' because a password with the same id already exists.')
                    }
                }
                else
                {
                    console.log('Skipping import because type is not password or note.')
                }
            }

            this.WriteUserData()
            
            return true
        }catch(e)
        {
            console.log(e)
            return false
        }
    }

    FileExists()
    {
        return fs.existsSync(userDataPath)
    }

    AddPassword(name, url, username, password)
    {
        let encPass = encrypt(config.getMasterPassword(), password)
        this.userDataObj.push(
            {
                "id": crypto.randomInt(9999,99999999),
                "type": "password",
                "url": url,
                "name": name,
                "username": username,
                "password": encPass
            }
        )

        return true
    }

    EditPassword(id, name, url, username, password)
    {
        let encPass = encrypt(config.getMasterPassword(), password)
        for(let i=0; i < this.userDataObj.length; i++)
        {
            if(this.userDataObj[i].id == id) 
            {
                this.userDataObj[i].name = name
                this.userDataObj[i].url = url
                this.userDataObj[i].username = username
                this.userDataObj[i].password = encPass
                return true
            }
        }
    }

    DeletePassword(id)
    {
        for(let i = 0; i < this.userDataObj.length; i++)
        {
            if(this.userDataObj[i].type == "password" && this.userDataObj[i].id == id)
            {
                this.userDataObj.splice(i, 1)
                break
            }
        }
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