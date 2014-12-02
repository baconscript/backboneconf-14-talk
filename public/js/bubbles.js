var TIME_SCALE, UPDATE_INTERVAL, X, colors, counter, data, dx, keystream, t, tdx, tx, tx0, update, x;

counter = 0;

TIME_SCALE = 10e3;

UPDATE_INTERVAL = 20;

X = d3.scale.linear().domain([0, TIME_SCALE]).range([0, -$(window).width()]);

x = function(d) {
  var z;
  return z = X(+new Date() - d.time) + 'px';
};

dx = function(d) {
  var z;
  return z = X(+new Date() + UPDATE_INTERVAL - d.time) + 'px';
};

t = function(s) {
  return "translateX(" + s + ")";
};

tdx = function(d) {
  return t(dx(d));
};

tx = function(d) {
  return t(x(d));
};

tx0 = t('0px');

colors = d3.scale.category10();

console.log(colors);

data = [];

keystream = $('body').asEventStream('keyup').map('.which').map(function(k) {
  return {
    time: new Date(),
    key: String.fromCharCode(k),
    color: 'black',
    bg: colors(k % 10),
    id: counter++
  };
});

keystream.map(function(x) {
  return [x];
}).scan([], '.concat').map(function(f) {
  return f.filter(function(k) {
    return (+new Date() - k.time) < TIME_SCALE;
  });
}).onValue(function(v) {
  return data = v;
});

update = function() {
  var bubbles, bubblesEnter;
  bubbles = d3.select(".stream").selectAll(".bubble").data(data, function(d) {
    return d.id;
  });
  bubblesEnter = bubbles.enter().append('div');
  bubblesEnter.classed('bubble', true).style('background-color', function(d) {
    return d.bg;
  }).style('color', function(d) {
    return d.color;
  }).style('right', '0').style('transform', tx0).style('-moz-transform', tx0).style('-webkit-transform', tx0);
  bubblesEnter.append('span').text(function(d) {
    return d.key;
  });
  return bubbles.style('transform', tdx).style('-moz-transform', tdx).style('-webkit-transform', tdx);
};

update(startData);

setInterval((function() {
  return update(startData);
}), UPDATE_INTERVAL);
