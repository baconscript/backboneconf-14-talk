;(function(){
  var socket = io();
  socket.on('ack', function(){
    $('#note').html('ready');
  });
  socket.on('note', function(data){
    $('#note').html(data.note);
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
})();
