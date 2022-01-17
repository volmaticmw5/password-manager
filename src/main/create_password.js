import { ipcMain } from 'electron';

ipcMain.on('createSubmit', (event, arg) => {
    if(arg.password && arg.password_confirm)
    {
        if(arg.password.length >= 8 && arg.password == arg.password_confirm)
        {
            event.sender.send('submitCreateResponse', {
                result: true,
                message: "Success"
            });
        }
        else
        {
            event.sender.send('submitCreateResponse', {
                result: false,
                message: "This password is too weak or the passwords don't match, please try again."
            });
        }
    }
    else
    {
        event.sender.send('submitCreateResponse', {
            result: false,
            message: "This password is not valid, please try another one."
        });
    }
});