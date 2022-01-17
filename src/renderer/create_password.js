const form = document.querySelector('#register');
form.addEventListener('submit', submitForm);

function submitForm(e)
{
    e.preventDefault();
    window.api.send("createSubmit", {
        password: $('#password').val(),
        password_confirm: $('#password_confirm').val()
    });

    window.api.receive("submitCreateResponse", (data) => {
        if(data.result)
        {
            $('#create_error').hide();
            window.api.send('createMasters',{
                password: $('#password').val()
            });
        }
        else
        {
            $('#create_error').show();
            $('#create_error').html(data.message);
        }
    })
}