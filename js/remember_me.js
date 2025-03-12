// salvam in cookie ca sa ramanem conectati
document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault();
    
    const rememberMe = document.getElementById('remember-me').checked;
    if (rememberMe) {
        const email = document.querySelector('input[type="text"]').value;
        document.cookie = `email=${email}; max-age=2592000`;
    } else {
        document.cookie = 'email=; max-age=0';
    }

    alert("Formularul a fost trimis!");
});

window.onload = function() {
    const emailCookie = document.cookie.split('; ').find(row => row.startsWith('email='));
    if (emailCookie) {
        const email = emailCookie.split('=')[1];
        document.querySelector('input[type="text"]').value = email;
    }
};
