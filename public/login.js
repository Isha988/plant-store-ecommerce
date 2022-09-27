/**
 * @param {Event} e
 */



document.querySelector("#forgetPasswordLink")
    .addEventListener("click", (e) => {
        e.preventDefault();
        forgetPassowrd();
    })

const url = "http://localhost:8080/";
function forgetPassowrd () {
    const userEmail = document.querySelector("#login-form input[type=email]").value;
    
        fetch("http://localhost:8080/forgetPassword", {
            method: "POST",
            headers: {
                'Content-type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({email : userEmail})
            }).then((response) => {
               return response.text();
            }).then( text => {
                alert(text);
            }).catch( error => {
                console.log("error: " , error);
            });  

}