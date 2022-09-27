// // crousel

const crousel= document.querySelectorAll(".crousel-page");
const dot = document.querySelectorAll(".dot");

let crouselLength= crousel.length;
let index = 0;
let interval = setInterval(automaticCrousel, 5000);

function infinityCrousel(){
    index = (index*Math.sign(index)) % 2;
    crousel[index].classList.remove("unactive");
    dot[index].classList.add("active");

    for(let i=0; i<crousel.length; i++){
        if(i==index) continue;
        crousel[i].classList.add("unactive");
        dot[i].classList.remove("active");
    }
}
function currentCrousel(){
    clearInterval(interval);
    infinityCrousel();
    interval = setInterval(automaticCrousel, 5000);
}
function automaticCrousel(){
    index++;
    infinityCrousel();
}
