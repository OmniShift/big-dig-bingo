function changeMarked(row, col) {
    var index = (row * 5) + col;
    document.getElementById("markedSvg").children[index].classList.toggle("marked");
}

function saveMarked() {
    var markedArray = [];
    for (var image in document.getElementById("markedSvg").children) {
        markedArray.push(image.className);
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
    $.post(`../save_card`, { cardurl: cardUrl, marked: marked }, function(result) {
        if (result == "success") {
            alert("Your bingo card was saved successfully");
        } else {
            alert(result);
        }
    });
}