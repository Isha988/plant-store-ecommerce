

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
            printData(this.response);
          }
          xhttp.open("get","/cartSmall");
          xhttp.send();
        
      })

      
      function printData(data){
        const cart = document.querySelector("#small-cart-data");
        let template1 = document.getElementById("template1");
        let template2 = document.getElementById("template2");
        let result = JSON.parse(data);
        let len = result.items.length;
        if(len){
          cart.textContent= "";
          for( let i= 0; i<len; i++){
            let clone = template1.content.cloneNode("true");
            clone.querySelector('img').setAttribute("src", result.items[i].plant.src[0]);
            clone.querySelector('.item-text a').innerHTML = result.items[i].plant.name;
            clone.querySelector('.item-text span').innerHTML = result.items[i].unit + " X $" + result.items[i].plant.price;
            clone.querySelector('.remove').setAttribute("data", result.items[i].plant._id);
            cart.appendChild(clone);
          }
          let clone = template2.content.cloneNode("true");
            clone.getElementById("smallCartTotal").innerHTML = result.total;
            cart.appendChild(clone);
          removeFromCart();
        }
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

// shop page product view toggle
// const products = document.getElementById("products");
// const gridView = document.getElementById("gridView");
// const listView = document.getElementById("listView");
//   function grid() {
//     gridView.classList.add("active");
//     listView.classList.remove("active");
//     products.classList.remove("shop-page-product");
//   }

//   function list() {
//     gridView.classList.remove("active");
//     listView.classList.add("active");
//     products.classList.add("shop-page-product");
//   }

//crousel
// const crousel= document.getElementsByClassName("crousel-page");
// const dot = document.getElementsByClassName("dot");

// let crouselLng = crousel.length;
// let dotLng = dot.length;
// let index = 0;

// function currentCrousel(index){
//     if (index >= crouselLng) {
//         index=0;
//     }
//     if (index < 0){
//         index = crouselLng;
//     }
//     for (let i=0; i < crouselLng; i++ ){
//         crousel[i].style.display="none";
//         dot[i].classList.remove("active");
//     }
//     crousel[index].style.display = "flex";
//     dot[index].classList.add("active");
// }

// (function automatic(){
//    if (index >= crouselLng) {
//         index=0;
//     }
//     if (index < 0){
//         index = crouselLng;}

//     currentCrousel(index);
//     index++;
//     setTimeout(automatic,5000);
// })();

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
  let unit = 1;
  if(document.getElementById("productUnit")) {
    if(document.getElementById("productUnit").value){
      unit = document.getElementById("productUnit").value;
    };
  }
  const xhttp = new XMLHttpRequest();
  xhttp.onload = function() {
    alert(this.response);
    updateCart();
  }
  xhttp.open("get","/cart/" + name + "?unit=" + unit);
  xhttp.send();
}

//remove cart item 
function removeFromCart() {
  document.querySelectorAll('.userCart .remove').forEach(ele => {
    ele.addEventListener('click' , e => {
      e.preventDefault();
        const name = e.target.getAttribute("data");
        const xhttp = new XMLHttpRequest();
        xhttp.onload = function() {
          if(this.response == 'success'){
            const list = document.querySelectorAll(`.userCart [data = '${name}']`);
            list.forEach(ele => {
              const tr = ele.parentNode.parentNode;
              const tbody = tr.parentNode;
              tbody.removeChild(tr);
            })
             alert('item removed');
             updateCart(updateCallback);
          }
          else {
            alert('this.response');
          }
        }
        xhttp.open("delete","/cart/" + name);
        xhttp.send();
      
    })
  })
}
removeFromCart();

//changing unit of cart 
function cartUnit(operation, btn) {
  let input = btn.parentNode.firstElementChild;
    let value = input.value;
    if (operation == 'add' && value >= 1 && value <5){
      input.value = parseInt(input.value) + 1;
    }
    if (operation == 'sub' && value > 1 && value <=5){
      input.value = parseInt(input.value) - 1;
    }
}


function onlyNumberKey(evt) {
          
  // Only ASCII character in that range allowed
  var ASCIICode = (evt.which) ? evt.which : evt.keyCode
  if (ASCIICode > 48 &&  ASCIICode <54)
      return true;
  return false;
}


// update cart
function updateCart(callback) {
  const input = document.querySelectorAll('#quantity input');
  var len = input.length;
  var list = [];
  for(let i=0; i<len; i++){
    let obj = {
      id: input[i].name ,
      unit : input[i].value
    }
    list.push(obj);
  }
  const xhttp = new XMLHttpRequest();
  xhttp.onload = callback;

  xhttp.open("post", "/updateCart");
  xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhttp.send(JSON.stringify(list));

}

function updateCallback () {
  let total;
  const cart = JSON.parse(this.response);
  if( total = document.getElementById("smallCartTotal")){
    total.innerHTML = cart.total;
  }

  if(document.getElementById('updateBtn')) {
    document.getElementById('totalItem').innerHTML= cart.totalItem;
    document.getElementById('cartTotal').innerHTML= cart.total;

    const totals = document.querySelectorAll('.userCart .total');
    const input = document.querySelectorAll('.userCart input')
    let len = totals.length;
    for(let i=0; i<len; i++){
      totals[i].innerHTML = cart.items[i].total;
      input[i].value = cart.items[i].unit;
    };
    document.getElementById('updateBtn').innerHTML = "update cart";
  }
}

function updateBtn() {
  document.getElementById('updateBtn').innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
  setTimeout(()=> {
    updateCart(updateCallback);
  }, 2000);
};

//wishlist
function addToWishlist(name){
  const xhttp = new XMLHttpRequest();
  xhttp.onload = function() {
    alert(this.response);
  }
  xhttp.open("get","/wishlist/" + name);
  xhttp.send();
}

//remove wishlist item 
document.querySelectorAll('#wishlist .remove').forEach(ele => {
  ele.addEventListener('click' , e => {
    e.preventDefault();
      const name = e.target.getAttribute("data");
      const xhttp = new XMLHttpRequest();
      xhttp.onload = function() {
        if(this.response == 'success'){
           const tr = e.target.parentNode.parentNode;
           const tbody = tr.parentNode;
           tbody.removeChild(tr);
           alert('item removed');
        }
        else {
          alert(this.response);
        }
      }
      xhttp.open("delete","/wishlist/" + name);
      xhttp.send();
    
  })
})

// product page images

function changeImage(div) {
  const image =  document.getElementById("product-image-single");
  const newImage = div.childNodes[1].src ;
  image.src = newImage;

}