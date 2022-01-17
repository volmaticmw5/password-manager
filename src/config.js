const config = require('electron-json-config')
const {shell} = require('electron');
const crypto = require('crypto')

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

module.exports.HasMasterPassword = HasMasterPassword
module.exports.SetMastersPassword = SetMastersPassword
module.exports.Purge = Purge
module.exports.OpenConfigurationFile = OpenConfigurationFile
module.exports.getMasterPassword = getMasterPassword