document.addEventListener('DOMContentLoaded', async function () {

    const userList = await fetch('/admin/api/getUsers', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        } 
    }).then((res) => res.json())
    console.log(userList);
    if(userList.success){
        var x  = '';
        document.getElementById('usersTable').innerHTML = ""
        userList.users.forEach( (data) => {
            if(data.isBlocked){
                x = `<tr>
                <td class="name">${data.name}</td>
                <td class="email">${data.email}</td>
                <td class="adress">${data.address}</td>
                <td class="dob">${data.dob}</td>
                <td>
                <button style=" background-color: green;" data-id=${data._id} class="temp-delete-button"><ion-icon name="remove-circle"></ion-icon></button>
                <button style=" background-color: red;" data-id=${data._id} class="delete-button"><ion-icon name="trash-outline"></ion-icon></button>
                </td>
            </tr>`
            } else {
                x = `<tr>
                <td class="name">${data.name}</td>
                <td class="email">${data.email}</td>
                <td class="adress">${data.address}</td>
                <td class="dob">${data.dob}</td>
                <td>
                <button data-id=${data._id} class="temp-delete-button"><ion-icon name="ban"></ion-icon></button>
                <button style=" background-color: red;" data-id=${data._id} class="delete-button"><ion-icon name="trash-outline"></ion-icon></button>
                </td>
            </tr>`
            }
            
            document.getElementById('usersTable').innerHTML += x;
        })
     //   const editButtons = document.querySelectorAll('.edit-button');
        const deleteButtons = document.querySelectorAll('.delete-button');
        const tempDeleteButtons = document.querySelectorAll('.temp-delete-button');
            deleteButtons.forEach(deleteButton => {
                deleteButton.addEventListener('click', async() => {
                    const row = deleteButton.closest('tr');
                    const id = deleteButton.dataset.id

                    const updatedData = {
                        id: id
                    };
                    console.log('Delete Data:', updatedData);
                    const editData = await fetch('/admin/api/deleteUser', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedData),
                    })
                    .then((res) => res.json());
                    console.log(editData);
                    if(editData.success){
                        console.log(editData.success);
                        // alert("User blocked successfully")
                        openToast('success', editData.success);
                        setTimeout( () => {
                            window.location.reload(true);
                        }, 6000)
                        
                    } else {
                        // alert("Failed to block employee")
                        openToast('error', editData.error)
                    } 
                });
                });
            tempDeleteButtons.forEach(deleteButton => {
                deleteButton.addEventListener('click', async() => {
                    const row = deleteButton.closest('tr');
                    const id = deleteButton.dataset.id

                    const updatedData = {
                        id: id
                    };
                    console.log('Delete Data:', updatedData);
                    const editData = await fetch('/admin/api/blockUser', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedData),
                    })
                    .then((res) => res.json());
                    console.log(editData);
                    if(editData.success){
                        console.log(editData.success);
                       // alert("User blocked successfully")
                        openToast('success', editData.success);
                        setTimeout( () => {
                            window.location.reload(true);
                        }, 6000)
                        
                    } else {
                       // alert("Failed to block employee")
                        openToast('error', editData.error)
                    } 
                });
                });
    }
});