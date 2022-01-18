const form = document.querySelector('#syncing')
const dialogTxt = document.getElementById('dialog')
const testSync = document.getElementById('testSync')
form.addEventListener('submit', submitForm)
dialogTxt.innerHTML = ''

window.api.send('LoadSyncSettings')
window.api.receive('LoadSyncSettings', (data) => {
    document.getElementById('username').value = data.username
    document.getElementById('host').value = data.hostname
})

function submitForm(e)
{
    e.preventDefault()
    window.api.send('SyncSettingsUpdate', {
        username: document.getElementById('username').value,
        hostname: document.getElementById('host').value,
        password: document.getElementById('password').value
    })
}

window.api.receive("SyncUpdateFailed", (data) => {
    dialogTxt.innerHTML = data.msg
})

window.api.receive("SyncUpdateSucc", (data) => {
    window.close()
    window.api.send('TrySync', {})
})

testSync.addEventListener('click', (e) => {
    e.preventDefault()
    dialogTxt.innerHTML = 'Validating...'

    window.api.send('TrySyncConnect', {
        username: document.getElementById('username').value, 
        hostname: document.getElementById('host').value, 
        password: document.getElementById('password').value
    })
})

window.api.receive('SyncTryFailed', (data) => {
    dialogTxt.innerHTML = '<font color="red">' + data.msg + '</font>'
})

window.api.receive('SyncMessageUpdate', (data) => {
    dialogTxt.innerHTML = data.msg
})