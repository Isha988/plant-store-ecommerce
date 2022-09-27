
/**
 * @param {Event} e
 */
const searchList = document.querySelector("#searchList");
document.querySelector("#search-input").
    addEventListener("input",  debounce((e) => validationOfInput(e.target.value)))


function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

function validationOfInput(value){
    const search = value.trim();
    const regex = /[^a-zA-z0-9 ]/g;
    const regex2 = /\\/g ;
    if(!search || search.match(regex) || search.match(regex2)){
        searchList.innerHTML="";
        return;
    }
    fetchingData(search);
}

function fetchingData(search){
    fetch("http://localhost:8080/search",{
        method: "POST",
        headers: {
            'Content-type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify({search : search})
    }).then((response)=> {
        return response.text();
    }).then((text)=> {
        const result = JSON.parse(text);
        searchList.innerHTML = "";
        result.forEach(element => {
            appendListItem(element);
        });
    })
}
   
function appendListItem(element){
    const clone = document.querySelector("#searchItemTemp").content.cloneNode(true);
    clone.querySelector("img").src = element.src[0];
    clone.querySelector("a").innerHTML = element.name;
    clone.querySelector("a").setAttribute("href", `/shop/product/${element.name}`);
    searchList.append(clone);
}