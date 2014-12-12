;(function(){
  var socket = io();
  var timerInterval, startTime, elapsed = 0;
  socket.on('ack', function(){
    $('#note').html('ready');
  });
  socket.on('note', function(data){
    $('#note').html(data.note);

    $('input').on('keyup',function(e){
      socket.emit('keyup', e.which);
    });
  });
  socket.emit('syn');
  $('#font-dn').click(function(){
    socket.emit('font-size',-1);
  });
  $('#font-up').click(function(){
    socket.emit('font-size',1);
  })
  $('#settings-btn').click(function(){
    $('#settings').modal('show');
  });
  $('#next').click(function(){
    socket.emit('next');
  });
  $('#back').click(function(){
    socket.emit('back');
  });
  $('#refresh').click(function(){
    socket.emit('refresh');
    document.location.reload();
  });
  $('#restart').click(function(){
    socket.emit('restart');
  });
  function pad(n){return n < 10? '0'+n : ''+n;}
  function startTimer(){
    startTime = +new Date();
    timerInterval = setInterval(function(){
      var dur = elapsed + (+new Date() - startTime)/1000;
      $('#timer').text(
        Math.floor(dur/60) + ':' +
        pad(Math.floor(dur%60))
      );
    }, 500);
    $('#timer').css('font-weight','700').one('click', stopTimer);
  }
  function stopTimer(){
    if(timerInterval != null) clearInterval(timerInterval);
    elapsed = (+new Date()-startTime)/1000;
    $('#timer').css('font-weight','400').one('click', startTimer);
  }
  function resetTimer(){
    elapsed = 0;
    $('#timer').text('0:00');
  }
  $('#timer').css('font-weight','400').one('click', startTimer);
  $('#reset-timer').click(resetTimer);
})();
