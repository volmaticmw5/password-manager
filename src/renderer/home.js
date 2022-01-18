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
const deleteModalClose = document.getElementById('closeDeleteBtn')
const deleteModalClose2 = document.getElementById('closeDeleteBtn2')
const deleteBtnConfirm = document.getElementById('deleteBtnConfirm')
const editPasswordModal = document.getElementById('edit_password_modal')
const editModalClose = document.getElementById('closeEditBtn')
const form = document.querySelector('#newPassword')
const editForm = document.querySelector('#editPassword')

let toDeleteIdTemp = -1
let toEditIdTemp = -1

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

editForm.addEventListener('submit', (e) => {
  e.preventDefault();
  editPasswordModal.classList.remove('is-active')

  window.api.send('EditSavePassword', {
    id: toEditIdTemp,
    name: document.getElementById('input_edit_password_name').value,
    url: document.getElementById('input_edit_password_url').value,
    username: document.getElementById('input_edit_password_username').value,
    password: document.getElementById('input_edit_password_password').value
  })
});

editModalClose.addEventListener('click', (e) => {
  editPasswordModal.classList.remove('is-active')
  document.getElementById('input_edit_password_name').value = ''
  document.getElementById('input_edit_password_url').value = ''
  document.getElementById('input_edit_password_username').value = ''
  document.getElementById('input_edit_password_password').value = ''
  toEditIdTemp = -1
})

deleteBtnConfirm.addEventListener('click', (e) => {
  window.api.send('DeletePassword', {id: toDeleteIdTemp})
  document.getElementById('delete_modal').classList.remove('is-active')
  toDeleteIdTemp = -1
})

deleteModalClose2.addEventListener('click', (e) => {
  document.getElementById('delete_modal').classList.remove('is-active')
})

deleteModalClose.addEventListener('click', (e) => {
  document.getElementById('delete_modal').classList.remove('is-active')
})

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

// Response from edit password
window.api.receive('GetPasswordValuesResponse', (resp) => {
  document.getElementById('input_edit_password_name').value = resp.data.name
  document.getElementById('input_edit_password_url').value = resp.data.url
  document.getElementById('input_edit_password_username').value = resp.data.username
  document.getElementById('input_edit_password_password').value = resp.data.password
  editPasswordModal.classList.add('is-active')
})

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
                    <a href="#" onclick="editPassword('`+entry.id+`')"><i class="fas fa-pencil-alt has-text-info"></i></a>
                </div>
                <div class="card-footer-item">
                    <a href="#" onclick="deleteModal('`+entry.id+`')"><i class="fas fa-trash has-text-danger-dark"></i></a>
                </div>
              </div>
            </div>
            <br />
            `
        }
    })
})

editPassword = (id) => {
  toEditIdTemp = id
  window.api.send('GetPasswordValues', {id:id})
}

deleteModal = (id) => {
  document.getElementById('delete_modal').classList.add('is-active')
  toDeleteIdTemp = id
}

copyPassword = (id) => {
    window.api.send('CopyPassword', {id: id})

    clipboardAlert.style.display = 'block'
    setTimeout(() => {
        clipboardAlert.style.display = 'none'
    }, 2000);
}