const config = require('electron-json-config')
const {shell} = require('electron');
const crypto = require('crypto');
const { decrypt } = require('./crypt');

function HasMasterPassword()
{
    if(config.has('master_password'))
        return true;
    else
        return false;
}

function getMasterPassword()
{
    if(config.has('master_password'))
        return config.get('master_password');
    
    return '';
}

function SetMastersPassword(password)
{
    let encPassword = crypto.createHmac('sha256', 'salty').update(password).digest('hex');
    config.set('master_password', encPassword)
}

function Purge()
{
    config.purge()
}

function OpenConfigurationFile()
{
    let file = config.file()
    shell.openPath(file);
}

function UpdateSyncSettings(host, user)
{
    config.set('sync', {
        username: user,
        hostname: host
    })
}

function GetSyncSettings()
{
    if(config.has('sync'))
    {
        return config.get('sync')
    }
    else
    {
        return {hostname: '', username: ''}
    }
}

module.exports.HasMasterPassword = HasMasterPassword
module.exports.SetMastersPassword = SetMastersPassword
module.exports.Purge = Purge
module.exports.OpenConfigurationFile = OpenConfigurationFile
module.exports.getMasterPassword = getMasterPassword
module.exports.UpdateSyncSettings = UpdateSyncSettings
module.exports.GetSyncSettings = GetSyncSettings