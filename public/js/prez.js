;(function(){
  var $body = $('body');
  var $slides = window.$slides = $body.children('.el');
  var currentSlide = 0;
  var $currentSlide = $($slides[currentSlide]);
  var keyup = $('body').asEventStream('keyup').map(x => x.which);
  keyup.log();

  keyup.filter(function(x){return x===39 || x===40}).log('adv').onValue(advanceSubslide);
  keyup.filter(function(x){return x===37 || x===38}).log('adv').onValue(retreatSubslide);

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
  }

  function advanceSlide(){
    runExitScript();
    currentSlide++;
    console.log('Advancing to slide '+currentSlide);
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
    console.log('Retreating to slide '+currentSlide);
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
