window.onload = function() {
    var children = document.getElementById("markedOverlay").children;
    var w = document.getElementById("markedOverlay").offsetWidth / 100 * 20.2;
    var h = document.getElementById("markedOverlay").offsetHeight / 100 * 20.2;
    for (var row = 0; row < 5; row++) {
        for (var col = 0; col < 5; col++) {
            var index = (row * 5) + col;
            children[index].style.left = w * col + "px";
            children[index].style.top = h * row + "px";
        }
    }
};

function changeMarked(row, col) {
    var children = document.getElementById("markedOverlay").children;
    var index = (row * 5) + col;
    children[index].getElementsByTagName('img')[0].classList.toggle("marked");
}

function saveMarked() {
    var markedArray = [];
    var imageArray = document.getElementById("markedOverlay").children;
    for (var i = 0; i < imageArray.length; i++) {
        markedArray.push(imageArray[i].children[0].className);
    }
    console.log(markedArray);
    var marked = [];
    for (var i = 0; i < 5; i++) {
        console.log(markedArray.slice(5*i, (5*i)+5));
        marked.push(markedArray.slice(5*i, (5*i)+5));
    }
    console.log(marked);
    var cardUrl = "";
    if (window.location.hostname == "localhost") {
        cardUrl = "testURL";
    } else {
        cardUrl = window.location.pathname.split("/bingocard=")[1];
    }
    $.post(`../save_card`, { cardUrl: cardUrl, marked: marked }, function(result) {
        if (result == "success") {
            alert("Your bingo card was saved successfully");
        } else {
            alert(result);
        }
    });
}