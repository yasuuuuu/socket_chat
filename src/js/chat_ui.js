import Chat from './chat';
import $ from 'jquery';

function divEscapedContentElement(message) {
  return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
  return $('<div></div>').html(`<i>${message}</i>`);
}

function processUserInput(chatApp, socket) {
  const message = $('#send-message').val();
  let systemMessage;

  if (message.charAt(0) === '/') {
    systemMessage = chatApp.processCommand(message);
    if (systemMessage) {
      $('#messages').append(divSystemContentElement(systemMessage));
    }
  } else {
    chatApp.sendMessage($('#room').text(), message);

    $('#messages').append(divEscapedContentElement(message));
    $('#messages').scrollTop($('#message').prop('scrollHeight'));
  }

  $('#send-message').val('');
}

const socket = io.connect();

$(document).ready(() => {
  const chatApp = new Chat(socket);

  socket.on('nameResult', (result) => {
    let message;

    if (result.success) {
      message = `You are now known as ${result.name}.`;
    } else {
      message = result.message;
    }
    $('#messages').append(divSystemContentElement(message));
  });

  socket.on('joinResult', (result) => {
    $('#room').text(result.room);
    $('#messages').append(divSystemContentElement('Room changed.'));
  });

  socket.on('message', (message) => {
    const newElement = $('<div></div>').text(message.text);
    $('#messages').append(newElement);
  });

  socket.on('rooms', (rooms) => {
    $('#room-list').empty();

    for(let room in rooms) {
      room = room.substring(1, room.length);
      if (room != '') {
        $('#room-list').append(divEscapedContentElement(room));
      }
    }

    $('#room-list div').click(() => {
      chatApp.processCommand('/join ' + $(this).text());
      $('#send-message').focus();
    });
  });

  setInterval(function() {
    socket.emit('rooms');
  }, 1000);

  $('#send-message').focus();

  $('#send-form').submit(function() {
    processUserInput(chatApp, socket);
    return false;
  });
});
