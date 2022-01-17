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