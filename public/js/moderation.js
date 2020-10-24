var socket = io();

function toggleMarked(elem) {
    elem.classList.toggle('marked');
    var obj = {
        id: elem.id.substr(1),
        marked: elem.classList.contains('marked') ? 'marked' : ''
    }
    socket.emit('toggle mark', obj);
}

socket.on('toggle mark', (elemId) => {
    console.log(`Toggling element c${elemId}`);
    document.getElementById(`c${elemId}`).classList.toggle('marked');
});