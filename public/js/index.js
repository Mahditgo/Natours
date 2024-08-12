import '@babel/polyfill'
import { login, logout } from './login'
import { updateDataSetting } from './updateSetting'

const loginForm = document.querySelector('.form--login')
const logoutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')

if(loginForm) {
loginForm.addEventListener('submit', el => {
    el.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password)
})

}



if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);  // Call the logout function
    };


if(userDataForm) {
    userDataForm.addEventListener('submit', el => {
        el.preventDefault();

        const form = new FormData();
        form.append('name', document.getElementById('name').value)
        form.append('email', document.getElementById('email').value)
        form.append('photo', document.getElementById('photo').files[0])
        // const email = document.getElementById('email').value;
        // const name = document.getElementById('name').value;
        
        updateDataSetting(form, 'data')
    })
}

// if (userDataForm) {
//     userDataForm.addEventListener('submit', event => {
//         event.preventDefault();

//         const form = new FormData();
//         form.append('name', document.getElementById('name').value);
//         form.append('email', document.getElementById('email').value); // Fixed typo here
//         form.append('photo', document.getElementById('photo').files[0]);

//         updateDataSetting(form, 'data'); // Pass the form directly, not as an object
//     });
// }


if(userPasswordForm) {
    userPasswordForm.addEventListener('submit', async el => {
        el.preventDefault();

        document.querySelector('.btn--save-password').textContent = 'Updating ...'

        const currentPassword = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        
        await updateDataSetting({currentPassword, password, passwordConfirm}, 'password')
        

        document.querySelector('.btn--save-password').textContent = 'Save password'
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    })

}