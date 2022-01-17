import { ipcMain } from 'electron';

ipcMain.on('Login', (event, arg) => {
    let result = user.Login(arg.password)
    event.sender.send('LoginResult', result)
});