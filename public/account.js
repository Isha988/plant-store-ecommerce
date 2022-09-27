const billingInput = document.querySelectorAll("#billingAddress input");
const shippingInput = document.querySelectorAll("#shippingAddress input");
const length = billingInput.length;

const checkbox = document.querySelector("#addressCheckbox");
    checkbox.addEventListener("input", (e)=>{
        if(!e.target.checked){  
            billingInput.forEach((input)=> {
                input.removeEventListener("input", inputValue);
            });
            shippingInput.forEach((input)=>{
               input.removeAttribute("disabled");
            })
            return;
        }

        inputValue();
        billingInput.forEach((input)=> {
            input.addEventListener("input", inputValue);
        })
        shippingInput.forEach((input)=>{
            input.setAttribute("disabled", true);
        })
    })
        
function inputValue(){
    let i=0;
    for(i=0; i<length ; i++){
        shippingInput[i].value = billingInput[i].value;
    }
}