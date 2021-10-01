/**
 * @param {Event} e
 */
const overlay = document.getElementById("overlay");

// nav bar toggle 
const navbar = document.querySelector("#navbar-small");
const bars = document.querySelector("#open-navbar-small").
addEventListener("click", (e) =>{
    e.preventDefault();
    overlay.classList.remove("hide");
    navbar.classList.remove("hide");
})

const cross = document.querySelector("#remove-navbar-small").
addEventListener("click", (e) => {
    e.preventDefault();
    overlay.classList.add("hide");
    navbar.classList.add("hide");
}) 

// small-cart toggle
const smallCart = document.getElementById("small-cart");
const cartOpen = document.getElementById("open-small-cart")
      .addEventListener("click", (e)=>{
        e.preventDefault();
          const xhttp = new XMLHttpRequest();
          xhttp.onload = function() {
            overlay.classList.remove("hide");
            smallCart.classList.remove("hide");
            console.log(this.response);
            printData(this.response);
          }
          xhttp.open("get","/cartSmall");
          xhttp.send();
        
      })

      var source = document.querySelector("#template").html();
      var templateMissions = Handlebars.compile(source);
      
      function printData(data){
        var dataStamp = {
                  items: data.items,
                  total: data.total
        }
        var template = template(dataStamp)
        $('#small-cart').append(template);
          // for (var i = 0; i < datas.length; i++) {
          //     var data = datas[i];
          //     var dataStamp = {
          //         name: data.name,
          //         description: data.description,
          //         img: data.imageUrl
          //     }
          //     var template = template(dataStamp)
          //     $('#small-cart').append(template);
          // }
      };
      



const cartRemove = document.getElementById("remove-cart")
    .addEventListener("click", (e)=>{
      e.preventDefault();
        overlay.classList.add("hide");
        smallCart.classList.add("hide");
    })

// search toggle

const search = document.getElementById("search");
const searchOpen = document.getElementById("open-search")
    .addEventListener("click", (e)=>{
        e.preventDefault();
        overlay.classList.remove("hide");
        search.classList.remove("hide");
    })

const searchRemove =  document.getElementById("remove-search")
  .addEventListener("click", (e)=>{
    e.preventDefault();
    overlay.classList.add("hide");
    search.classList.add("hide");
  })


//crousel
/*const crousel= document.getElementsByClassName("crousel-page");
const dot = document.getElementsByClassName("dot");

let crouselLng = crousel.length;
let dotLng = dot.length;
let index = 0;

function currentCrousel(index){
    if (index >= crouselLng) {
        index=0;
    }
    if (index < 0){
        index = crouselLng;
    }
    for (let i=0; i < crouselLng; i++ ){
        crousel[i].style.display="none";
        dot[i].classList.remove("active");
    }
    crousel[index].style.display = "flex";
    dot[index].classList.add("active");
}

(function automatic(){
   if (index >= crouselLng) {
        index=0;
    }
    if (index < 0){
        index = crouselLng;}

    currentCrousel(index);
    index++;
    setTimeout(automatic,5000);
})();*/

// shop page selector
const arrows = document.querySelectorAll(".select .fa-caret-down" );

arrows.forEach(arrow => {
    arrow.addEventListener("click", openList);
  });

function openList(e){
   const target = e.target;
   const grandparent = e.target.parentNode.parentNode;
    
   grandparent
        .querySelector("ul")
            .toggleAttribute("hidden");
}

//info-section tabs
    const tabs = document.querySelectorAll('[role="tab"]');

    // Add a click event handler to each tab
    tabs.forEach(tab => {
      tab.addEventListener("click", changeTabs);
    });
  
  
  function changeTabs(e) {
    e.preventDefault(); 
    const target = e.target;
    const parent = target.parentNode;
    const grandparent = parent.parentNode;
  
    // Remove all current selected tabs
    parent
      .querySelectorAll('.active')
      .forEach(t => t.classList.remove("active"));
  
    // Set this tab as selected
    target.classList.add("active");
  
    // Hide all tab panels
    grandparent
      .querySelectorAll('[role="tabpanel"]')
      .forEach(p => p.setAttribute("hidden", true));
  
    // Show the selected panel
    grandparent
      .querySelector(`#${target.getAttribute("aria-controls")}`)
      .removeAttribute("hidden");
}


// checkout page hide
const open = document.querySelectorAll(".checkout-open");

open.forEach(open => {
  open.addEventListener("click", unhide);
})

function unhide(e){
  const grandparent = e.target.parentNode.parentNode;
  grandparent.querySelector(".checkout-card").classList.toggle("hide");
}

//cart 
function addToCart(name){
  const xhttp = new XMLHttpRequest();
  xhttp.onload = function() {
    alert(this.response);
  }
  xhttp.open("get","/cart/" + name);
  xhttp.send();
}

//wishlist
function addToWishlist(name){
  const xhttp = new XMLHttpRequest();
  xhttp.onload = function() {
    alert(this.response);
  }
  xhttp.open("get","/wishlist/" + name);
  xhttp.send();
}

