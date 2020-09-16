$(document).ready(function() {
    $(`#createCardButton`).click(function() {
        var name = prompt(`Name`);
        if (name != null) {
            $.post(`../gen_card`, { username: name }, function(result) {
                if (result != null && result.includes(`/bingocard=`)) {
                    var cardUrl = result.split(`=`)[1];
                    window.location.href = `/bingocard=${cardUrl}`;
                }
            });
        }
    })

    $(`#loadCardButton`).click(function() {
        var cardUrl = prompt(`Card code`);
        if (cardUrl != null) {
            $.get(`../bingocard=${cardUrl}`, function(result) {
                if (result != null) {
                    alert(result);
                }
            });
        }
    })

    $(`#modButton`).click(function() {
        alert("You have found the rare Button of Coming SoonTM-ish!");
        // You have found the even rarer Comment of You Sneaky Console Reader!
        /*var pw = prompt(`Password`);
        if (pw != null) {
            $.get(`../modButton`, { password: pw });
        }*/
    })
})