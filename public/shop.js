const minInput = document.querySelector("#price-min");
const maxInput = document.querySelector("#price-max");

const minBubble = document.querySelector("#bubble-min");
const maxBubble = document.querySelector("#bubble-max");

const rangeSelected = document.querySelector("#price-selected-range");

minInput.addEventListener("input", setMin);
maxInput.addEventListener("input", setMax);

function setMin() {
    const val = minInput.value;
    const max = minInput.max;
    const left = (val/max)*100;
    if (val > (parseInt(maxInput.value)- 10)){
        minInput.value = (maxInput.value -10);
    }
    else {
        minBubble.innerHTML = "$"+val;
        minBubble.style.left = left+'%';
        rangeSelected.style.left = left+'%';
    }

}
setMin();

function setMax() {
    const val = maxInput.value;
    const max = maxInput.max;
    const right = 100 - (val/max)*100;
    ;
    if (val < (parseInt(minInput.value)+ 10)){
        maxInput.value = (parseInt(minInput.value)+ 10) ;
    }
    else {
        maxBubble.innerHTML = "$"+val;
        maxBubble.style.right = right+'%';
        rangeSelected.style.right = right+'%';
    }

}
setMax();

const priceLink = document.querySelector("#price-link");
minInput.addEventListener("mouseup", ()=> {
    link(priceLink, "minprice", minInput.value);
    priceLink.click();
});

maxInput.addEventListener("mouseup", ()=> {
    link(priceLink, "maxprice", maxInput.value);
    priceLink.click();
});

const sortSelect = document.querySelector("#sort-select");

sortSelect.addEventListener("input", ()=> {
    link(priceLink, "sort", sortSelect.value);
    priceLink.click();
});

window.onload = document.querySelectorAll(".page-tag")
    .forEach(tag => {
        link(tag, "page", tag.innerHTML);
    })

    function link(atag, prop, val){
        const params = new URLSearchParams(window.location.search);
        if(params.has(prop)){
            params.set(prop, val);
        }
        else{
            params.append(prop, val);
        }
        atag.href = "/shop?"+params;
    }


