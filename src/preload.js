const {contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            ipcRenderer.removeAllListeners([channel])
            ipcRenderer.send(channel, data);
        },
        receive: (channel, func) => {
            ipcRenderer.removeAllListeners([channel])
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
);
