function uuid(e){return e?(e^16*Math.random()>>e/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid)}

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
    var bg = color(v),
      html = map(v),
      id = uuid(),
      generated = new Date();
    return {
      html: map(v),
      background: bg,
      id: id,
      generated: new Date(),
      isError: v.isError,
      isEnd: v.isEnd
    };
  });
  updates.onValue(function(val){
    var $div = $('<div>',{'data-id':val.id});
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
        'background-color': val.background
      });
    }
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
  return charFromKeycode(event.keyCode);
}

function weatherBinder(chance){
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

var keyup = $('body').asEventStream('keyup').map(mapKeycodes).merge(Bacon.once(new Bacon.Error()).delay(1000)).name("keyup"),
  keys11 = keyup.slidingWindow(11).map(x => x.join('')).withDescription(keyup, 'map', 'x => x.join("")'),
  konami = keys11.filter(x => x === '↑↑↓↓←→←→ba↩').withDescription(keys11, 'filter', "x => x === '↑↑↓↓←→←→ba↩'"),
  weather = Bacon.fromBinder(weatherBinder(0.3)).name('weather'),
  weather3 = Bacon.fromBinder(weatherBinder()).name('weather').take(3),
  weatherGood = Bacon.fromBinder(weatherBinder()).name('weather'),
  weatherFilter = weatherGood.filter(t => t>41)
    .withDescription(weather,'filter',"t => (t >= 41)"),
  weatherMap = weatherFilter.map(t => t+"&deg; F")
    .withDescription(weatherFilter,'map','t => t+"&deg; F"');

$body = $('body');

keyup.asBubbleStream({element:'#key-stream'});
weather.asBubbleStream({element:'#sample-error'});
weather3.asBubbleStream({element:'#sample-end'});
weatherGood.asBubbleStream({element:'#weather-good'});
weatherFilter.asBubbleStream({element:'#weather-filter'});
weatherMap.asBubbleStream({element:'#weather-map'});
weatherMap.assign($('#temp-display'),'html');
