const loadingText = document.getElementById('loading_text')
const main = document.getElementById('main')
const mainCenterContent = document.getElementById('main_center')
const notesLink = document.getElementById('notes')
const notesModalClose = document.getElementById('notesModalClose')
const clipboardAlert = document.getElementById('copyNotification')
const clipboardClose = document.getElementById('clipboardNotificationClose')

// Set styles
clipboardAlert.style.display = "none";
loadingText.style.display = "block";
main.style.display = "none";

// Get user data
window.api.send("GetUserData", {});

notesLink.addEventListener('click', (e) => {
    let modal = document.getElementById('notes_modal')
    modal.classList.add('is-active')
})

notesModalClose.addEventListener('click', (e) => {
    let modal = document.getElementById('notes_modal')
    modal.classList.remove('is-active')
})

// Populate main content
window.api.receive("UserDataResponse", (resp) => 
{
    loadingText.style.display = "none";
    main.style.display = "block";

    let userData = resp.data
    if(userData.length == 0)
        mainCenterContent.innerHTML = "<center>It's so empty in here :(</center>"

    userData.forEach(function(entry)
    {
        if(entry.type == "password")
        {
            mainCenterContent.innerHTML += `
            <div class="card">
              <div class="card-header"><p class="card-header-title">`+entry.name+`</p></div>
              <div class="card-content">
                <div class="content">
                    `+entry.username+`
                </div>
              </div>
              <div class="card-footer">
                <div class="card-footer-item">
                `+entry.url+`
                </div>
                <div class="card-footer-item">
                    <a href="#" onclick="copyPassword('`+entry.id+`')"><i class="fas fa-copy has-text-primary"></i></a>
                </div>
                <div class="card-footer-item">
                    <a href="#"><i class="fas fa-pencil-alt has-text-info"></i></a>
                </div>
                <div class="card-footer-item">
                    <a href="#"><i class="fas fa-trash has-text-danger-dark"></i></a>
                </div>
              </div>
            </div>
            <br />
            `
        }
    })
})

copyPassword = (id) => {
    window.api.send('CopyPassword', {id: id})

    clipboardAlert.style.display = 'block'
    setTimeout(() => {
        clipboardAlert.style.display = 'none'
    }, 2000);
}

clipboardClose.addEventListener('click', (e) => {
    clipboardAlert.style.display = 'none'
})