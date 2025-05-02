document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#login-form');
    const signupForm = document.querySelector('#signup-form');
    const loginSection = document.querySelector('#login-section');
    const signupSection = document.querySelector('#signup-section');
    const loginLink = document.querySelector('#login-link');
    const signupLink = document.querySelector('#signup-link');
    const logoutLink = document.querySelector('#logout-link');
    const profileLink = document.querySelector('#profile-link');
    const rememberMe = document.querySelector('#remember-me');
    const loginBtn = document.querySelector('#login-btn');
    const signupBtn = document.querySelector('#signup-btn');

    const cookieToken = getCookie('token');
    if (cookieToken && !localStorage.getItem('token')) {
    localStorage.setItem('token', cookieToken);
    }

    function hideForms() {
        loginSection?.style.setProperty('display', 'none');
        signupSection?.style.setProperty('display', 'none');
    }

    function showSection(section) {
        hideForms();
        if (section === 'login') {
            loginSection?.style.setProperty('display', 'block');
        } else if (section === 'signup') {
            signupSection?.style.setProperty('display', 'block');
        }
    }

    function toggleNavbar() {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token') || getCookie('token');
        
        if (user && token) {
            profileLink?.style.setProperty('display', 'block');
            logoutLink?.style.setProperty('display', 'block');
            loginLink?.style.setProperty('display', 'none');
            signupLink?.style.setProperty('display', 'none');
        } else {
            profileLink?.style.setProperty('display', 'none');
            logoutLink?.style.setProperty('display', 'none');
            loginLink?.style.setProperty('display', 'block');
            signupLink?.style.setProperty('display', 'block');
        }
    }

    // Initial logic to check the URL parameters
    const params = new URLSearchParams(window.location.search);
    const formType = params.get('form');
    if (formType === 'signup') {
        showSection('signup');
    } else {
        showSection('login');
    }

    // event listeners
    loginBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        showSection('login');
    });

    signupBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        showSection('signup');
    });

    // fct div log msg
    function showMessage(text, type = 'success') {
        const messageDiv = document.querySelector('.alert-msg');
        if (!messageDiv) return;
        
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

    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }

    function validatePassword(password) {
        const minLength = 8;
        const hasUpper = /[A-Z]/;
        const hasLower = /[a-z]/;
        const hasDigit = /[0-9]/;
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/;

        if (password.length < minLength)
            return { isValid: false, message: `Parola trebuie să aibă cel puțin ${minLength} caractere.` };
        if (!hasUpper.test(password))
            return { isValid: false, message: 'Parola trebuie să conțină cel puțin o literă mare.' };
        if (!hasLower.test(password))
            return { isValid: false, message: 'Parola trebuie să conțină cel puțin o literă mică.' };
        if (!hasDigit.test(password))
            return { isValid: false, message: 'Parola trebuie să conțină cel puțin un număr.' };
        if (!hasSpecial.test(password))
            return { isValid: false, message: 'Parola trebuie să conțină cel puțin un caracter special.' };

        return { isValid: true, message: 'Parola este validă.' };
    }

    // LOGIN
    async function handleLogin() {
        try {
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());
    
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
    
            const result = await response.json();
            if (!response.ok) throw new Error(result.msg || 'Eroare la autentificare');
    
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
    
            if (rememberMe?.checked) {
                document.cookie = `token=${result.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
            }
    
            showMessage("Autentificare reușită!", 'success');
            setTimeout(() => window.location.href = '/frontend/html/userProfile.html', 1500);
        } catch (error) {
            showMessage(error.message, 'error');
            console.error('Login error:', error);
        }
    }

    // SIGNUP
    async function handleSignup() {
        try {
            const formData = new FormData(signupForm);
            const data = Object.fromEntries(formData.entries());
    
            const passwordValidation = validatePassword(data.password);
            if (!passwordValidation.isValid) {
                showMessage(passwordValidation.message, 'error');
                return;
            }
    
            if (data.password !== data.confirm_password) {
                throw new Error('Parolele nu coincid!');
            }
    
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data),
            });
    
            const result = await response.json();
            if (!response.ok) throw new Error(result.msg || 'Eroare la înregistrare');
    
            localStorage.setItem('user', JSON.stringify(result.user));
    
            showMessage("Înregistrare reușită!", 'success');
            setTimeout(() => window.location.href = '/frontend/html/dashboard.html', 1500);
        } catch (error) {
            showMessage(error.message, 'error');
            console.error('Signup error:', error);
        }
    }

    // FORMS
    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });

    signupForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSignup();
    });

    logoutLink?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        document.cookie = 'token=; Max-Age=0; path=/;';
        window.location.href = '/frontend/html/homepage.html';
    });

    toggleNavbar();
});
