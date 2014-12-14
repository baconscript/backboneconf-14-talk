$(function(){
  function uuid(e){return e?(e^16*Math.random()>>e/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid)}

  var contrastingColor = (function(){
    function contrastingColor(color)
    {
      return (luma(color) >= 165) ? '000' : 'fff';
    }
    function luma(color) // color can be a hx string or an array of RGB values 0-255
    {
      var rgb = (typeof color === 'string') ? hexToRGBArray(color) : color;
      return (0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2]); // SMPTE C, Rec. 709 weightings
    }
    function hexToRGBArray(color)
    {
      if (color.length === 3)
        color = color.charAt(0) + color.charAt(0) + color.charAt(1) + color.charAt(1) + color.charAt(2) + color.charAt(2);
      else if (color.length !== 6)
        throw('Invalid hex color: ' + color);
      var rgb = [];
      for (var i = 0; i <= 2; i++)
        rgb[i] = parseInt(color.substr(i * 2, 2), 16);
      return rgb;
    }
    return contrastingColor;
  })();

  /**
   * @class Bacon.Observable
   * @method asBubbleStream
   * @param [opt]
   * @param [opt.element] jQuery element or selector to display the stream within
   * @param [opt.map] function to map each value to printable HTML
   * @param [opt.color] function to map each value to a color
   * @param [opt.duration] length of the timeline shown on-screen, default 10s
   * @param [opt.code] code to display with the stream, may be a Bacon.Property
   */
  Bacon.Observable.prototype.asBubbleStream = function(opt){
    var map, $element, color, code, $code, duration, stream = this, updates;
    opt = opt || {};
    if(opt.element){
      $element = $(opt.element).first();
    } else {
      $element = $('<div>');
    }

    map = opt.map || function(e){
      return e? e.toString():'';
    };
    color = opt.color || function(){
      return '#dcdcdc';
    };
    duration = opt.duration || 10e3;
    code = opt.code || this.toString();
    if(code.constructor !== Bacon.Property && code.constructor !== Bacon.Observable){
      code = Bacon.constant(code);
    }
    $element.html('');
    $element.addClass('stream');
    $code = $('<code>');
    $element.append($code);
    code.onValue(function(code){
      $code.text(code);
    });
    updates = stream.mapError(function(err){
      return {isError: true, err: err};
    }).mapEnd(function(){return {isEnd:true}}).map(function(v){
      v = v || {};
      var bg = color(v) || '#dcdcdc',
        fg = '#'+contrastingColor(bg.match(/[a-fA-F0-9]+/)[0]),
        html = map(v),
        id = uuid(),
        generated = new Date();
      return {
        html: map(v),
        background: bg,
        foreground: fg,
        id: id,
        generated: new Date(),
        isError: v.isError,
        isEnd: v.isEnd
      };
    });
    updates.onValue(function(val){
      var $div = $('<div>',{'data-id':val.id,'class':'out'});
      var $span = $('<span>');

      if(val.isError){
        $div.addClass('error');
      } else if(val.isEnd){
        $div.addClass('end');
      } else {
        $div.addClass('bubble');
        $span.html(val.html);
        $div.append($span);
        $div.css({
          'background-color': val.background,
          color: val.foreground
        });
      }
      setTimeout(function(){
        $div.removeClass('out');
      },1);
      $div.css({
        'left': '100%',
        opacity: 1
      }).animate({
        left: '0%'
      }, {duration:duration, easing: 'linear', done: function(){
        if(val.isEnd){
          return;
        }
        $div.animate({
          opacity: 0,
          left: '-'+(500*100/duration)+'%'
        }, {duration: 500, easing: 'linear', done: function(){
          $div.remove();
        }})
      }});
      $element.append($div);
    });
    return $element;
  }
  function mapKeycodes(event){
    return charFromKeycode(event);
  }

  window.weatherBinder = function weatherBinder(chance){
    chance = chance || 0;
    return function(sink){
      var running = true;
      function pushEvent(){
        if(Math.random()<chance){
          sink(new Bacon.Error());
        }else {
          sink(Math.round((Math.random()*5+38)*10)/10);
        }
        if(running){
          setTimeout(pushEvent, Math.random()*1000+1000);
        }
      }
      setTimeout(pushEvent,Math.random()*500);
      return function(){
        running = false;
      }
    }
  }

  function colorFromName(name){
    switch(name){
      case 'red': return '#a00';
      case 'blue': return '#00b';
      case 'green': return '#0B0';
      case 'yellow': return '#ee0';
      case 'orange': return '#f90';
      case 'purple': return '#70f';
    }
  }

  var keyup = window.keyup.map(mapKeycodes).name("$('body').asEventStream('keyup')"),
    keys11 = keyup.slidingWindow(11).map(x => x.join('')).withDescription(keyup, 'map', 'x => x.join("")'),
    konami = keys11.filter(x => x === '↑↑↓↓←→←→ba↩').withDescription(keys11, 'filter', "x => x === '↑↑↓↓←→←→ba↩'"),
    weather = Bacon.fromBinder(weatherBinder(0.3)).name('weather'),
    weather3 = Bacon.fromBinder(weatherBinder()).name('weather').take(3),
    weatherGood = Bacon.fromBinder(weatherBinder()).name('weather'),
    weatherFilter = weatherGood.filter(t => t>41)
      .withDescription(weather,'filter',"t => (t >= 41)"),
    weatherMap = weatherFilter.map(t => t+"&deg; F")
      .withDescription(weatherFilter,'map','t => t+"&deg; F"'),
    mergeA = Bacon.interval(2000,'A').name('stream1'),
    mergeB = Bacon.interval(2000,'B').delay(1000).name('stream2'),
    mergeAB = mergeA.merge(mergeB),
    combineA = Bacon.fromBinder(function(sink){
      var colors = ['red','green','blue','yellow','orange','purple'];
      var running = true;
      function newColor(){
        sink(colors[Math.floor(Math.random()*colors.length)]);
        if(running){
          setTimeout(newColor, Math.random()*2000+2000);
        }
      }
      newColor();
      return function(){running=false;};
    }).name('stream1'),
    combineB = Bacon.fromBinder(function(sink){
      var numbers = [1,2,3,4,5,6];
      var running = true;
      function newNumber(){
        sink(numbers[Math.floor(Math.random()*numbers.length)]);
        if(running){
          setTimeout(newNumber, Math.random()*2000+500);
        }
      }
      newNumber();
      return function(){running=false;};
    }).name('stream2'),
    combineAB = combineA.combine(combineB, function(color, number){
      return {color: colorFromName(color), number: number};
    }),
    flatMapURLs = Bacon.interval(2000, 'http://...').name('urls'),
    flatMapAJAX = flatMapURLs.map('&rarr;').name('urls.map(makeAjaxRequest)'),
    flatMapResponse = flatMapURLs.delay(500).map('<tt>{...}</tt>').name('urls.flatMap(makeAjaxRequest)'),
    pollInterval = Bacon.interval(1000),
    pollMap1 = pollInterval.map(function(){return +new Date()}),
    pollSlide = pollMap1.slidingWindow(2,2),
    scan1 = Bacon.interval(2000).map(function(){return Math.floor(Math.random()*9+1)}).name('numbers'),
    scan2 = scan1.scan(0, function(a,b){return a+b})
      .withDescription(scan1,'scan','add')
    ;

  $body = $('body');

  function _constant(x){
    return function(){return x;};
  }

  keyup.asBubbleStream({element:'#key-stream'});
  weather.asBubbleStream({element:'#sample-error'});
  weatherGood.asBubbleStream({element:'#weather-good'});
  weatherFilter.asBubbleStream({element:'#weather-filter'});
  weatherMap.asBubbleStream({element:'#weather-map'});
  weatherMap.assign($('#temp-display'),'html');
  window.showMergeExample = function showMergeExample(){
    mergeA.asBubbleStream({element:'#merge-ex1',color:_constant('#a00')});
    mergeB.asBubbleStream({element:'#merge-ex2',color:_constant('#00b')});
    mergeAB.asBubbleStream({element:'#merge-ex3', color:function(x){
      return x==='A'?'#a00':'#00b';
    }});
  };
  window.hideMergeExample = function hideMergeExample(){
    $('#merge-ex1').html('');
    $('#merge-ex2').html('');
    $('#merge-ex3').html('');
  };
  window.showCombineExample = function showCombineExample(){
    combineA.asBubbleStream({element:'#combine-ex1',map: _constant(''),color:function(x){return colorFromName(x)}});
    combineB.asBubbleStream({element:'#combine-ex2'});
    combineAB.asBubbleStream({
      element:'#combine-ex3',
      map:function(x){return x.number},
      color:function(x){return (x.color)},
      code: 'stream1.combine(stream2, function(color, number){...})'
    });
  };
  window.hideCombineExample = function hideCombineExample(){
    $('#combine-ex1').html('');
    $('#combine-ex2').html('');
    $('#combine-ex3').html('');
  };
  window.showFlatMapExample = function showFlatMapExample(){
    flatMapURLs.asBubbleStream({element:'#flatmap-ex-urls',color: _constant('#fe0')});
    flatMapResponse.asBubbleStream({element:'#flatmap-ex-ajax-flat',color:_constant('#fb0')});
  };
  window.hideFlatMapExample = function hideFlatMapExample(){
    $('#flatmap-ex-urls, #flatmap-ex-ajax-streams, #flatmap-ex-ajax-flat').html('');
  };
  window.showScan = function(){
    scan2.asBubbleStream({element:'#scan-2'});
  }
  scan1.asBubbleStream({element:'#scan-1'});
});
