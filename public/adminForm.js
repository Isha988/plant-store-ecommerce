/**
 * @param {Event} e
 */
const informationPairs = document.querySelector("#informationPair");
const pairTemplate = document.querySelector("#pairTemplate");
const addInfo = document.querySelector("#addInfo");

const form = document.querySelector("#productForm");

// add info inputs
addInfo.addEventListener("click", ()=> {
    const clone = pairTemplate.content.cloneNode(true);
    informationPairs.insertBefore(clone, addInfo);
})

//form submission
form.addEventListener("submit", (e)=> {
    e.preventDefault();
    let url = "http://localhost:8080/admin/new"
    const data = accessingData();
    const id = e.target.getAttribute("data");
    if(id){
        url = `http://localhost:8080/admin/edit/${id}`
    }
    sendingData(data,url);
   
})

function accessingData(){
    const formData = new FormData();
    formData.append("name", form.querySelector("input[name=name]").value.trim() );
    formData.append("price",form.querySelector("input[name=price]").value);
    formData.append("shortDesc",form.querySelector("textarea[name=shortDesc]").value);

    form.querySelector("input[name=categories]").value.split(",").forEach(category => {
        formData.append("categories", category);
    })

    form.querySelector("input[name=tag]").value.split(",").forEach(tag => {
        formData.append("tag", tag);
    })
    form.querySelectorAll(".pair").forEach(pair => {
            const object = {
                name : pair.querySelector("input[name=informationHeading]").value,
                info : pair.querySelector("textarea[name=informationText]").value
            }
            formData.append("information", JSON.stringify(object));
    })
    
    formData.append("longDesc", form.querySelector("textarea[name=longDesc]").value );
    
    for(let i = 0; i < form.querySelector("input[name=image]").files.length; i++) {
        formData.append("image" , form.querySelector("input[name=image]").files[i]);
    }
    return formData;
}

 function sendingData(data, url){
    fetch( url,{
        method: "POST",
        body: data
        }).then((response) => {
            if(!response.ok) throw new Error
            return response.text();
        }).then(text => {
            messageBox(text, "success");
            location.href = "http://localhost:8080/admin/dashboard";
        }).catch( error => {
            const text = "error occur! try again later"
            messageBox(text, "error")
        }); 
}


function messageBox(text, prop){
    const clone = document.querySelector("#ajaxMsg").content.cloneNode("true");
    clone.querySelector(".msgText").innerHTML = text;
    clone.querySelector(".msg").classList.add(prop);
    document.body.append(clone);
}