var socket = io();

window.onload = function() {
    document.body.style.width = percentifyWidth(document.body.clientHeight, window.innerWidth) + "%";
    document.body.style.marginLeft = percentifyWidth(((window.innerWidth - document.body.clientWidth) / 2), window.innerWidth) + "%";
    document.getElementsByClassName("grass")[0].style.lineHeight = document.getElementsByClassName("grass")[0].clientHeight + "px";
    var bingoX = ((window.innerWidth - document.body.clientWidth) / 2);
    var bingoY = document.getElementsByClassName("grass")[0].clientHeight;
    var bingoLineHeight = window.innerHeight / 100 * 11;
    var bingoHeight = window.innerHeight - document.getElementsByClassName("grass")[0].clientHeight - (window.innerHeight / 100 * 8);
    document.getElementById("cellSvg").style.left = percentifyWidth(bingoX) + "%";
    document.getElementById("cellSvg").style.width = percentifyWidth(document.body.clientWidth) - 0.4 + "%";
    document.getElementById("cellSvg").style.top = percentifyHeight(bingoY + bingoLineHeight) + "%";
    document.getElementById("cellSvg").style.height = percentifyHeight(bingoHeight) - 0.4 + "%";

    var bingoLetters = document.getElementById("bingoLetters").children;
    var bingoChildren = document.getElementById("bingoValues").children;
    var markedChildren = document.getElementById("bingoMarked").children;
    var svgChildren = document.getElementById("cellSvg").children;
    var w = document.body.clientWidth / 100 * 19.5;
    for (var row = 0; row < 5; row++) {
        for (var col = 0; col < 5; col++) {
            if (row == 0) {
                bingoLetters[col].style.left = percentifyWidth(bingoX + (w * col)) + (0.2 * (col + 1)) + "%";
                bingoLetters[col].style.top = percentifyHeight(bingoY) + 1 + "%";
                bingoLetters[col].style.width = percentifyWidth(document.body.clientWidth / 5) - 0.25 + "%";
                bingoLetters[col].style.lineHeight = bingoLineHeight * 0.8 + "px";
            }
            var index = (row * 5) + col;
            bingoChildren[index].style.left = percentifyWidth(bingoX + (w * col)) + (0.2 * col) + "%";
            bingoChildren[index].style.top = percentifyHeight(bingoY + bingoLineHeight + ((bingoHeight / 5.3) * row)) + "%";
            bingoChildren[index].style.width = percentifyWidth(document.body.clientWidth / 5) - 0.25 + "%";
            bingoChildren[index].style.height = percentifyHeight(bingoHeight / 5) - 1.3 + "%";
            markedChildren[index].style.left = percentifyWidth(bingoX + (w * col)) + (0.2 * col) + "%";
            markedChildren[index].style.top = percentifyHeight(bingoY + bingoLineHeight + ((bingoHeight / 5.3) * row)) + "%";
            markedChildren[index].style.width = percentifyWidth(document.body.clientWidth / 5) - 0.25 + "%";
            markedChildren[index].style.height = percentifyHeight(bingoHeight / 5) - 1.3 + "%";
            svgChildren[index].setAttribute("x", (20.08 * col) + "%");
            svgChildren[index].setAttribute("y", (19 * row) + "%");
        }
    }
};

function percentifyWidth(val) {
    return (val / window.innerWidth) * 100;
}

function percentifyHeight(val) {
    return (val / window.innerHeight) * 100;
}

function changeMarked(row, col) {
    var children = document.getElementById("bingoMarked").children;
    var index = (row * 5) + col;
    children[index].getElementsByTagName("img")[0].classList.toggle("marked");

    // save changes
    var markedArray = [];
    var imageArray = document.getElementById("bingoMarked").children;
    for (var i = 0; i < imageArray.length; i++) {
        markedArray.push(imageArray[i].children[0].className);
    }
    var marked = [];
    for (var i = 0; i < 5; i++) {
        marked.push(markedArray.slice(5*i, (5*i)+5));
    }
    var cardUrl = "";
    if (window.location.hostname == "localhost") {
        cardUrl = "testURL";
    } else {
        cardUrl = window.location.pathname.split("/bingocard=")[1];
    }

    var obj = {
        cardUrl: cardUrl,
        marked: marked
    }
    socket.emit('save bingocard', obj);
}