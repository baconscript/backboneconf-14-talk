function uuid(e){return e?(e^16*Math.random()>>e/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid)}

/**
 * @class Bacon.Observable
 * @method asBubbleStream
 * @param opt
 * @param [opt.element] jQuery element or selector to display the stream within
 * @param [opt.map] function to map each value to printable HTML
 * @param [opt.color] function to map each value to a color
 * @param [opt.duration] length of the timeline shown on-screen, default 10s
 * @param [opt.code] code to display with the stream, may be a Bacon.Property
 */
Bacon.Observable.prototype.asBubbleStream = function(opt){
  var map, $element, color, code, $code, duration, stream = this, updates;
  if(!opt){
    throw new Error("You can't call showBubbleStream() without options. Sorry! Check the docs.");
  }
  if(opt.element){
    $element = $(opt.element).first();
  } else {
    $element = $('<div>');
  }

  map = opt.map || function(e){
    return e.toString();
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
  }).map(function(v){
    var bg = color(v),
      html = map(v),
      id = uuid(),
      generated = new Date();
    return {
      html: map(v),
      background: bg,
      id: id,
      generated: new Date(),
      isError: v.isError
    };
  });
  updates.onValue(function(val){
    var $div = $('<div>',{'data-id':val.id});
    var $span = $('<span>');

    if(val.isError){
      $div.addClass('error');
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


keystream = $('body').asEventStream('keyup').name("$('body').asEventStream('keyup')");

$('body').append(keystream.asBubbleStream({
  map: function(event){
    return charFromKeycode(event.keyCode);
  }
}));

$('body').append($('body').asEventStream('keydown').name("$('body').asEventStream('keydown')").asBubbleStream({
  map: function(event){
    return charFromKeycode(event.keyCode);
  }
}));
