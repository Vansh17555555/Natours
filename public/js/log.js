document.querySelector('.form--login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const url = 'http://127.0.0.1:3000/api/v1/users/login';
        const data = {
            email,
            password
        };

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: 'include' // Send cookies with the request
        };

        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error('Request failed');
        }

        const responseData = await response.json();
        
        // Check if login was successful
        if (responseData.status === 'success') {
            // Redirect to the home page
            alert('Login successful')
            window.location.href = '/'; // Change the URL as needed
        } else {
            // Handle login error (if needed)
        }

    } catch (error) {
        console.error('Error:', alert('Invalid Password or Email'));
    }
});
const logout = async () => {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/v1/users/logout', {
            method: 'GET',
             // Send cookies with the request
        });

        if (response.ok) {
            const responseData = await response.json();
            if (responseData.status === 'success') {
                location.reload(true); // Reload the page
            }
        } else {
            showAlert('error', 'Error logging out! Try again');
        }
    } catch (err) {
        showAlert('error', 'Error logging out! Try again');
    }
};

const logoutButton = document.getElementsByClassName('nav__el--logout')[0];
if (logoutButton) {
    logoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        logout();
    });
}

