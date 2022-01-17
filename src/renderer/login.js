const form = document.querySelector('#login')
const errorBox = document.getElementById('login_error')
form.addEventListener('submit', submitForm)

function submitForm(e){
    e.preventDefault();

    window.api.send("Login", {
        password: $('#password').val()
    });
}

window.api.receive("LoginResult", (data) => {
    if(data.result)
    {
        errorBox.innerHTML = "";
        window.api.send("GoHomeScreen")
    }
    else
    {
        errorBox.innerHTML = data.message
    }
})