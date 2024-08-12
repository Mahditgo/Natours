import { showAlert } from './alert'

export const login = async (email, password) => {
    console.log(email, password);
    try {
        const response = await fetch("http://127.0.0.1:3000/api/v1/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password })
        })

        // Parse the response as JSON
        const data = await response.json();
        console.log(data);
        // Check if the login was successful
        if (data.status === 'success') {
            showAlert('success', 'Logged in successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }else {
            // Handle errors and display the error message
            showAlert('error', data.message || 'An error occurred during login');
        }

        console.log(data);
    } catch (err) {
        showAlert('error', data.message);
    }
}


export const logout = async () => {
    try {

        const response = await fetch("http://127.0.0.1:3000/api/v1/users/logout", {
            method: "GET",
  
        });

        const data = await response.json();

        console.log(data);
        if(data.status === 'success') {
            location.reload(true);
        }

    } catch (err) {
        showAlert('error', 'ridy')
    }
}

















