$(document).ready(function() {
    $(`#createCardButton`).click(function() {
        var name = prompt(`Name`);
        if (name != null) {
            $.post(`../gen_card`, { username: name }, function(result) {
                var cardUrl = result.split(`=`)[1];
                if (cardUrl != undefined) {
                    window.location.href = `/bingocard=${cardUrl}`;
                } else {
                    alert(result);
                }
            });
        }
    })

    $(`#loadCardButton`).click(function() {
        var cardUrl = prompt(`Card code`);
        if (cardUrl != null) {
            window.location.href = `/bingocard=${cardUrl}`;
        }
        /*var cardUrl = prompt(`Card code`);
        if (cardUrl != null) {
            $.get(`../bingocard=${cardUrl}`, function(result) {
                // TODO error handling needs to be fixed
                if (result != null) {
                    alert(result);
                }
            });
        }*/
    })

    $(`#howToPlayButton`).click(function() {
        var htpDiv = $(`#howToPlayDiv`);
        showPopup(htpDiv);
        htpDiv.css(`width`, `${ (htpDiv.height() / 1.23) }px`);
        htpDiv.css(`left`, `${ ($(window).width() / 2) - (htpDiv.width() / 2) }px`);

        var htpBook = $(`#howToPlayBook`);
        htpBook.css(`width`, `${ (htpBook.height() / 1.23) }px`);
        
        var htpText = $(`#howToPlayText`);

        var howToPlayTexts = [];
        howToPlayTexts.push(`<h3><center>How to play</center></h3>
            All you need to play is to create a bingo card. 
            When you do, bookmark the page or note the 5 characters at the end of the URL so you can load it later. 
            Whenever you see a Big Dig streamer do something that's on your card, click to mark it. 
            When you have 5 marked fields in a row, column, or diagonal, you win!
            Save your bingo card and inform a moderator with your URL or 5-character card code.`);
        htpText.html(howToPlayTexts[0]);
    })

    $(`#modButton`).click(function() {
        var pw = prompt(`Password`);
        if (pw != null) {
            $.get(`../moderation`, { password: pw })
            .done(function(res) {
                document.write(res);
            }).fail(function(res) {
                alert(res.responseText);
            });
        }
    })

    $(`.closePopupButton`).click(function() {
        hidePopup($(this).parent());
    })

    $(":button").click(function() {
        $(this).css(`outline`, `none`);
    });
})

function showPopup(popupElement) {
    popupElement.parent().css(`visibility`, `visible`);
    popupElement.css(`visibility`, `visible`);
}
function hidePopup(popupElement) {
    popupElement.parent().css(`visibility`, `hidden`);
    popupElement.css(`visibility`, `hidden`);
}