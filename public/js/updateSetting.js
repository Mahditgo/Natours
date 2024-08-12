
// import { showAlert } from "./alert";


// export const updateDataSetting = async (data, type) => {
//     try {

//         const url = type === 'password' ? "http://127.0.0.1:3000/api/v1/users/updateMypassword" 
//         : "http://127.0.0.1:3000/api/v1/users/updateMe"

//         const response = await fetch(url, 
//             {
//                 method : 'PATCH',
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify(data)
//             }
//         )

//         const dataj = await response.json(); 
        
        
//         if(dataj.status === 'success') {
//             showAlert('success', `${type} updated successfully!`)
//         }

//     }catch(err) {
//         showAlert('error', data.message)
//     }
// }

// import { showAlert } from "./alert";

// export const updateDataSetting = async (data, type) => {
//     try {
//         const url = type === 'password' 
//             ? "http://127.0.0.1:3000/api/v1/users/updateMypassword" 
//             : "http://127.0.0.1:3000/api/v1/users/updateMe";

//         const response = await fetch(url, {
//             method: 'PATCH',
//             body: JSON.stringify(data)
//         });

//         const dataj = await response.json(); 
        
//         if (dataj.status === 'success') {
//             showAlert('success', `${type} updated successfully!`);
//         } else {
//             showAlert('error', dataj.message || 'Something went wrong!');
//         }
//     } catch (err) {
//         showAlert('error', err.message || 'Something went wrong!');
//     }
// };

import { showAlert } from "./alert";

export const updateDataSetting = async (formData, type) => {
    try {
        const url = type === 'password' 
            ? "http://127.0.0.1:3000/api/v1/users/updateMypassword" 
            : "http://127.0.0.1:3000/api/v1/users/updateMe";

        const response = await fetch(url, {
            method: 'PATCH',
            // Note: We don't set headers when using FormData
            body: formData
        });

        const dataj = await response.json();

        if (dataj.status === 'success') {
            showAlert('success', `${type} updated successfully!`);
        } else {
            showAlert('error', dataj.message || 'Something went wrong!');
        }
    } catch (err) {
        showAlert('error', err.message || 'Something went wrong!');
    }
};

