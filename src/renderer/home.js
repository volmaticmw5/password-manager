const loadingText = document.getElementById('loading_text')
const main = document.getElementById('main')
const mainCenterContent = document.getElementById('main_center')
const notesLink = document.getElementById('notes')
const notesModalClose = document.getElementById('notesModalClose')
const newPasswordModal = document.getElementById('new_password_modal')
const newPasswordClose = document.getElementById('newPasswordClose')
const newPasswordBtn = document.getElementById('newPasswordBtn')
const clipboardAlert = document.getElementById('copyNotification')
const clipboardClose = document.getElementById('clipboardNotificationClose')
const form = document.querySelector('#newPassword');

// Set styles
clipboardAlert.style.display = "none";
loadingText.style.display = "block";
main.style.display = "none";

// Get user data
window.api.send("GetUserData", {});

// Events
form.addEventListener('submit', (e) => {
  e.preventDefault();
  newPasswordModal.classList.remove('is-active')

  window.api.send('NewPassword', {
    name: document.getElementById('input_new_password_name').value,
    url: document.getElementById('input_new_password_url').value,
    username: document.getElementById('input_new_password_username').value,
    password: document.getElementById('input_new_password_password').value
  })
});

newPasswordBtn.addEventListener('click', (e) => {
  newPasswordModal.classList.add('is-active')
})

newPasswordClose.addEventListener('click', (e) => {
  newPasswordModal.classList.remove('is-active')
})

notesLink.addEventListener('click', (e) => {
    let modal = document.getElementById('notes_modal')
    modal.classList.add('is-active')
})

notesModalClose.addEventListener('click', (e) => {
    let modal = document.getElementById('notes_modal')
    modal.classList.remove('is-active')
})

clipboardClose.addEventListener('click', (e) => {
  clipboardAlert.style.display = 'none'
})

document.addEventListener('DOMContentLoaded', () => {
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
  if ($navbarBurgers.length > 0) {
    $navbarBurgers.forEach( el => {
      el.addEventListener('click', () => {
        const target = el.dataset.target;
        const $target = document.getElementById(target);
        el.classList.toggle('is-active');
        $target.classList.toggle('is-active');

        $target.classList.toggle('is-hidden-mobile')
        $target.classList.toggle('is-hidden-touch')
      });
    });
  }
});

// Populate main content
window.api.receive("UserDataResponse", (resp) => 
{
    loadingText.style.display = "none";
    main.style.display = "block";

    let userData = resp.data
    if(userData.length == 0)
        mainCenterContent.innerHTML = "<center>It's so empty in here :(</center>"

    mainCenterContent.innerHTML = ""
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