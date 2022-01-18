import { ipcMain, clipboard } from 'electron';
import UserData from '../udata';
const udata = new UserData()

ipcMain.on('GetUserData', (event, arg) => {
    if(udata.FileExists())
        udata.ReadUserData()

    event.sender.send('UserDataResponse', {
        data: udata.GetData()
    })
});

ipcMain.on('CopyPassword', (event, arg) => {
    if(!arg.id)
        return

    let readable = udata.GetPasswordFromId(arg.id)
    clipboard.writeText(readable)
})

ipcMain.on('NewPassword', (event, args) => {
    let res = udata.AddPassword(args.name, args.url, args.username, args.password)

    if(res)
    {
        udata.WriteUserData()
        event.sender.send('UserDataResponse', {
            data: udata.GetData()
        })
    }
})

ipcMain.on('EditSavePassword', (event, args) => {
    let res = udata.EditPassword(args.id, args.name, args.url, args.username, args.password)

    if(res)
    {
        udata.WriteUserData()
        event.sender.send('UserDataResponse', {
            data: udata.GetData()
        })
    }
})

ipcMain.on('DeletePassword', (event, args) => {
    if(args.id <= 0)
        return
    
    udata.DeletePassword(args.id)
    udata.WriteUserData()
    event.sender.send('UserDataResponse', {
        data: udata.GetData()
    })
})

ipcMain.on('GetPasswordValues', (event, args) => {
    let _data = udata.GetPasswordData(args.id)
    event.sender.send('GetPasswordValuesResponse', {
        data: _data
    })
})