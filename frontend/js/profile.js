// fct pt activarea edit profile
function enableEdit(fieldId) {
    const input = document.getElementById(fieldId);
    input.removeAttribute('readonly');
    input.focus();
    document.getElementById('saveChangesBtn').style.display = 'inline-block';
    document.getElementById('cancelChangesBtn').style.display = 'inline-block';
}

// fct pt reset profile pic
function resetProfileImage() {
    const defaultImage = "/trash/iconProfile.png";
    document.getElementById('profile-image').src = defaultImage;

    // update storage
    const user = JSON.parse(localStorage.getItem('user')) || {};
    user.profileImage = defaultImage;
    localStorage.setItem('user', JSON.stringify(user));

    if (user._id) {
        fetch(`/api/user/${user._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                profileImage: defaultImage
            })
        });
    }
}

function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/;
    const hasLowerCase = /[a-z]/;
    const hasDigits = /[0-9]/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

    // Verifică condițiile
    if (password.length < minLength) {
        return { isValid: false, message: `Parola trebuie să aibă cel puțin ${minLength} caractere.` };
    }
    if (!hasUpperCase.test(password)) {
        return { isValid: false, message: 'Parola trebuie să conțină cel puțin o literă mare.' };
    }
    if (!hasLowerCase.test(password)) {
        return { isValid: false, message: 'Parola trebuie să conțină cel puțin o literă mică.' };
    }
    if (!hasDigits.test(password)) {
        return { isValid: false, message: 'Parola trebuie să conțină cel puțin un număr.' };
    }
    if (!hasSpecialChar.test(password)) {
        return { isValid: false, message: 'Parola trebuie să conțină cel puțin un caracter special.' };
    }

    return { isValid: true, message: 'Parola este validă!' };
}

// fct change pw
async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showMessage("Toate câmpurile sunt obligatorii!", "error");
        return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
        showMessage(messageElement, passwordValidation.message, true);
        return;
    }

    if (newPassword !== confirmPassword) {
        showMessage("Parolele nu se potrivesc!", "error");
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));

    try {
        const response = await fetch(`http://localhost:5000/api/auth/change-password/${user._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage("Parola a fost schimbată cu succes!", "success");
            // Reset form
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } else {
            showMessage(data.msg || "Eroare la schimbarea parolei", "error");
        }
    } catch (err) {
        showMessage("Eroare de conexiune", "error");
        console.error(err);
    }
}

// fct div log msg
function showMessage(text, type = 'success') {
    const messageDiv = document.querySelector('.alert-msg');
    messageDiv.textContent = text;

    if (type === 'success') {
        messageDiv.style.backgroundColor = '#4BB543';
    } else if (type === 'error') {
        messageDiv.style.backgroundColor = '#FF4C4C';
    }

    messageDiv.style.display = 'block';
    messageDiv.style.opacity = '1';
    messageDiv.style.top = '20px';

    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.top = '0px';
    }, 3000);

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3500);
}

// save changes btn
document.getElementById('saveChangesBtn').addEventListener('click', async () => {
    const newUsername = document.getElementById('username').value;
    const newEmail = document.getElementById('email').value;
    const profileImage = localStorage.getItem('profileImage');
    const user = JSON.parse(localStorage.getItem('user'));

    const response = await fetch(`http://localhost:5000/api/auth/user/${user._id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            username: newUsername,
            email: newEmail,
            profileImage
        })
    });

    const responseData = await response.json();
    console.log(responseData);

    if (response.ok) {
        const updatedUser = { ...user, username: newUsername, email: newEmail, profileImage };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        showMessage("Datele au fost salvate cu succes!", "success");
        // ascunde btn de save si cancel
        document.getElementById('username').setAttribute('readonly', true);
        document.getElementById('email').setAttribute('readonly', true);
        document.getElementById('saveChangesBtn').style.display = 'none';
        document.getElementById('cancelChangesBtn').style.display = 'none';
    } else {
        showMessage(responseData.msg || "Eroare la salvare.", "error");
    }
});

// cancel btn
document.getElementById('cancelChangesBtn').addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('username').value = user.username;
    document.getElementById('email').value = user.email;

    document.getElementById('username').setAttribute('readonly', true);
    document.getElementById('email').setAttribute('readonly', true);

    document.getElementById('saveChangesBtn').style.display = 'none';
    document.getElementById('cancelChangesBtn').style.display = 'none';
});

// profile img
function previewImage(event) {
    const file = event.target.files[0];

    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imageUrl = e.target.result;

            document.getElementById('profile-image').src = imageUrl;

            const user = JSON.parse(localStorage.getItem('user')) || {};
            user.profileImage = imageUrl;
            localStorage.setItem('user', JSON.stringify(user));
        };

        reader.readAsDataURL(file);
    } else {
        alert("Te rog să alegi un fișier imagine.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));

        if (!user || !user.username || !user.email) {
            throw new Error("User invalid");
        }

        document.getElementById('username').value = user.username;
        document.getElementById('email').value = user.email;

        if (user.profileImage) {
            document.getElementById('profile-image').src = user.profileImage;
        }

        document.getElementById('profile-link').style.display = 'block';
        document.getElementById('logout-link').style.display = 'block';
        document.getElementById('login-link').style.display = 'none';
        document.getElementById('signup-link').style.display = 'none';

    } catch (err) {
        console.error("Eroare la profil:", err);
        localStorage.removeItem('user');
        window.location.href = "/frontend/html/forms.html";
    }
});