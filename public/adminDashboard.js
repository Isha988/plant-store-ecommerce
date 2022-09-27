/**
 * @param {Event} e
 */


// delete product
function deleteEventListener(){
    document.querySelectorAll(".deleteProduct").forEach(btn=> {
        btn.addEventListener("click", (e)=> {
            deleteProduct(e)
        });
    })
}
deleteEventListener();

function deleteProduct(e){
    const id = e.target.getAttribute("data");
    fetch("http://localhost:8080/admin/delete", {
        method: "DELETE",
        body:  JSON.stringify({id : id}),
        headers:{
            'Content-type': 'application/json;charset=UTF-8',
        },
        }).then(response => {
            if(!response.ok) throw new Error();
            return response.text();
        }).then(text => {
            messageBox(text, "success" );
            deleteProductUi(e);
        }).catch( error => {
            const text = "error occur! try again later"
            messageBox(text, "error")
        }); 
}

function deleteProductUi(e){
    const grandparent = e.target.parentNode.parentNode;
    grandparent.remove();
}
function messageBox(text, prop){
    const clone = document.querySelector("#ajaxMsg").content.cloneNode("true");
    clone.querySelector(".msgText").innerHTML = text;
    clone.querySelector(".msg").classList.add(prop);
    document.body.append(clone);
}


// show more
const showMoreBtn = document.querySelector("#showMore")
showMoreBtn .addEventListener("click", showMore);

const list = document.querySelector("#productList");
const elementTemplate = document.querySelector("#listElement");

function showMore(){
    let count = document.querySelectorAll(".productItems").length;
    fetch("http://localhost:8080/admin/showMore", {
        method:"POST",
        body:  JSON.stringify({count : count}),
        headers:{
            'Content-type': 'application/json',
        },
    }).then(response => {
        if(!response.ok) throw new Error();
        return response.json();
    }).then(json => {
        createListElement(json);
        deleteEventListener();
    }).catch( error => {
        const text = "error occur! try again later"
        messageBox(text, "error")
    });
}

function createListElement(elements) {
    elements.forEach(ele=>{
        const clone = elementTemplate.content.cloneNode(true);
        clone.querySelector("img").setAttribute("src", ele.src[0]);
        clone.querySelector(".text h3").innerHTML = ele.name;
        clone.querySelector(".text p").innerHTML = ele.price;
        clone.querySelector(".deleteProduct").setAttribute("data", ele._id);
        clone.querySelector(".editProduct").setAttribute("href", `/admin/edit/${ele._id}`)
        list.appendChild(clone);
    })
    if(elements.length < 5) showMoreBtn.remove();
}