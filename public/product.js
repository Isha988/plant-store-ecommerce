
const commentForm = document.querySelector("#commentForm");
const commentDiv = document.querySelector("#post-comment");
const template = document.querySelector("#commentTemplate");
const commentCover = document.querySelector("#commentCover");
const commentCount = document.querySelector("#commentCount"); 
const ratedStar = '<i class="fas fa-star"></i>';
const unratedStar = '<i class="far fa-star"></i>';
const rating = document.querySelector("#stars");

document.querySelector("#rv-tab").addEventListener("click",(e)=>{
    e.preventDefault();
    const id = e.target.getAttribute("data-id");
    fetchingComments(id);
})

function fetchingComments(id){
    fetch(`/comment/${id}`, {
        method: "GET"
    }).then(response=> {
        if(!response.ok) throw new Error();
        return response.text();
    }).then(text => {
        const res = JSON.parse(text);
            reviewUiupdate(res);    
    }).catch(error => {
        const text = "error occur! try again later"
        messageBox(text, "error")
    })
} 

if(commentForm){
    commentForm.addEventListener("submit", (e)=>{
        e.preventDefault();
        let id = e.target.getAttribute("data-id");
        let url = `/comment/${id}`
        const data = {
            stars: e.target.stars.value,
            comment: e.target.comment.value
        }
        sendingData(url, data);
        
    })
}

function sendingData(url, data){
    fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        if(!response.ok) throw new Error();
        return response.text();
    }).then(text => {
        const res = JSON.parse(text);

        messageBox(res.msg, "success")
        addCommentUiUpdate(res);
    }).catch(error => {
        const text = "error occur! try again later"
        messageBox(text, "error")
    })  
}

function addCommentUiUpdate({comment, review, star}){
    if (parseInt(commentCount.innerHTML) == 0){
        commentCover.innerHTML = "";
    }
    updatingUi(comment);
    document.querySelectorAll(".commentCount").forEach(count => {
        count.textContent = parseInt(count.innerHTML)+1;
    });
    let stars = Math.round(star / review);
    rating.innerHTML = "";
    for(let i=1; i<=5; i++){
        if(i<= stars){
            rating.innerHTML += ratedStar ;
        }else{
            rating.innerHTML += unratedStar;
        }
    }

}

function reviewUiupdate({prevComment, comments}){
    if(comments.length > 0){
        commentCover.innerHTML = "";
    }
    commentCount.textContent = comments.length;
    if(prevComment){updatingUi(prevComment);}
    comments.forEach(comment => {
        if(prevComment && prevComment.user._id == comment.user._id){
            return;
        }
        appendingComment(comment);
    })

}

function updatingUi(comment){
    commentDiv.remove();
    appendingComment(comment, "pre");
}

function appendingComment(comment, pre){
    const clone = template.content.cloneNode(true);
    clone.querySelector("h2").textContent = `${comment.user.firstName} ${comment.user.lastName}`;
    clone.querySelector("p.sub").textContent = formattingdate(comment.createdAt);
    clone.querySelector("p.review").textContent = comment.comment;
    let rating = clone.querySelector(".stars");
    for(let i=1; i<=5; i++){
        if(i<= comment.stars){
            rating.innerHTML += ratedStar ;
        }else{
            rating.innerHTML += unratedStar;
        }
    }
    if(comment.user.gender){
        clone.querySelector("img").src = `images/comment${(comment.user.gender).toLowerCase()}.jpg`
    }
    if(pre == "pre"){
        commentCover.prepend(clone);
    }else{
        commentCover.append(clone);
    }
}
function formattingdate(date){
    return (new Date(date).toDateString()).slice(3)
}
function messageBox(text, prop){
    const clone = document.querySelector("#ajaxMsg").content.cloneNode("true");
    clone.querySelector(".msgText").innerHTML = text;
    clone.querySelector(".msg").classList.add(prop);
    document.body.append(clone);
}