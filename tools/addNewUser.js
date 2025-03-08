const { list, createNewUser } = require('../libs/auth.js')
console.log('Adding New User')
const username = process.argv[2]
const password = process.argv[3]

createNewUser(username, password).then(async (response) => {
    if(response.ok){
        console.log('Added New User!', username)
    }else{
        console.log('Failed to Add New User!', username)
    }
    console.log(response)
    console.log(`New List`, await list())
}).catch(err => console.error);
