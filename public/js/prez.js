;(function(){
  var $body = $('body');
  var $slides = window.$slides = $body.children('.el');
  var currentSlide = 0;
  var $currentSlide = $($slides[currentSlide]);
  var keyup = $('body').asEventStream('keyup').map(x => x.which);

  var socket = io.connect(document.location.origin);

  keyup.filter(function(x){return x===39 || x===40})
    .merge(Bacon.fromEventTarget(socket, 'next')).log()
    .onValue(advanceSubslide);
  keyup.filter(function(x){return x===37 || x===38})
    .merge(Bacon.fromEventTarget(socket, 'back'))
    .onValue(retreatSubslide);

  Bacon.fromEventTarget(socket, 'font-size')
    .scan(+$('html').css('font-size').match(/[\d.]+/)[0], function(last, delta){
      return last + delta;
    }).onValue(function(size){
      $('html').css('font-size', size+'px');
    });

  $('.el').hide();
  runEntryScript();

  function runExitScript(){
    var $s = $currentSlide;
    var $exitScript = $s.children('script[type="x/on-exit"]');
    if($exitScript.length) {
      eval($exitScript.first().html());
    }
    $s.slideUp(function(){});
  }

  function runEntryScript(){
    var $s = $currentSlide;
    var $enterScript = $s.children('script[type="x/on-enter"]');
    if($enterScript.length){
      eval($enterScript.first().html());
    }
    var isDark = $s.attr('data-body-class') === 'dark';
    $body.toggleClass('dark',isDark);
    $s.slideDown(function(){});
    var $note = $currentSlide.children('.note');
    if($note.length){
      socket.emit('note',{note:$note.first().html()});
    }
  }

  function advanceSlide(){
    runExitScript();
    currentSlide++;
    if(currentSlide >= $slides.length){
      currentSlide = $slides.length;
      $('body').addClass('dark');
      $('.shows-over').fadeIn();
      return;
    }
    $currentSlide = $($slides[currentSlide]);
    runEntryScript();
  }

  function advanceSubslide(){
    var $e = $currentSlide.children('.el:not(:visible)')
    if($e.length) {
      var $t = $e.first();
      $t.slideDown();
      var $enterScript = $t.children('script[type="x/on-enter"]');
      if($enterScript.length){
        eval($enterScript.first().html());
      }
    } else {
      advanceSlide();
    }
  }


  function retreatSlide(){
    if(currentSlide === 0) return;
    runExitScript();
    currentSlide--;
    $currentSlide = $($slides[currentSlide]);
    $('.shows-over').hide();
    runEntryScript();
  }

  function retreatSubslide(){
    var $e = $currentSlide.children('.el:visible');
    if($e.length) {
      $e.last().slideUp();
      $e.last().each(function(){
        var $exitScript = $(this).children('script[type="x/on-exit"]');
        if($exitScript.length) {
          eval($exitScript.first().html());
        }
      });
    } else {
      retreatSlide();
    }
  }


})();
