const url = "http://127.0.0.1:8000/users"
const options = {
    method: 'GET',
    headers: {
        'accept': 'application/json'
    }
}
fetch(url, options).then(response => response.json()).then(data => {console.log(data)}).catch(error => console.error("Error:", error));