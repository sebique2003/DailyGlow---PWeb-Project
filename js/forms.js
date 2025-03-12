// Transition Signup-Login
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const loginSection = document.getElementById('login-section');
const signupSection = document.getElementById('signup-section');

loginBtn.addEventListener('click', () => {
    signupSection.style.display = 'none';
    loginSection.style.display = 'block';
    setTimeout(() => {
        loginSection.style.opacity = 1;
    }, 10);
});

signupBtn.addEventListener('click', () => {
    loginSection.style.display = 'none';
    signupSection.style.display = 'block';
    setTimeout(() => {
        signupSection.style.opacity = 1;
    }, 10);
});