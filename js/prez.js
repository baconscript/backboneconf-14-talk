;(function(){
  var $body = $('body');
  var $slides = window.$slides = $body.children('.el');
  var currentSlide = (function(){
    var sl = document.location.hash.match(/\d+/);
    if(sl){
      return +sl;
    }
    return 0;
  })();
  var $currentSlide = $($slides[currentSlide]);

  var keyup = window.keyup = $('body').asEventStream('keyup').map(function(x){return x.which});

  keyup.filter(function(x){return x===39 || x===40})
    .onValue(advanceSubslide);
  keyup.filter(function(x){return x===37 || x===38})
    .onValue(retreatSubslide);

  $('.el').hide();
  setTimeout(runEntryScript, 1000);

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
    }
    if(history.pushState){
      history.pushState(null, null, '#'+currentSlide);
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
    var $e = $currentSlide.find('.el:not(:visible)')
    if($e.length) {
      var $el = $e.first();
      $el.slideDown();
      var $enterScript = $el.children('script[type="x/on-enter"]');
      if($enterScript.length){
        eval($enterScript.first().html());
      }
      var $note = $el.children('.note');
      if($note.length){
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
    var $e = $currentSlide.find('.el:visible');
    if($e.length) {
      $e.last().slideUp();
      $e.last().each(function(){
        var $exitScript = $(this).children('script[type="x/on-exit"]');
        if($exitScript.length) {
          eval($exitScript.first().html());
        }
      });
      if($e.length === 1){
        var $note = $currentSlide.children('.note');
        if($note.length){
        }
      }
    } else {
      retreatSlide();
    }
  }

})();
