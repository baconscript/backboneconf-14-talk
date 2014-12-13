;(function(){

  function syncAsStream(method, model, options){
    return Bacon.fromPromise(
      Backbone.sync.apply(this, arguments);
    );
  }

  var Model = Backbone.Model.extend({
    sync: syncAsStream
  });

  var Collection = Backbone.Collection.extend({
    sync: syncAsStream
  });

  var Message = Model.extend();

  var ChatThread = Collection.extend({
    model: Message,
    url: '/api/messages',
    initialize: function(){
      this.poll = Bacon.interval(1000);
      this.lastUpdate = this.poll
        .scan(0, => +new Date())
        .slidingWindow(2,2)
        .map(x => x[1]);
      this.lastUpdate.sampledBy(poll).onValue(=> this.fetch());
    }
  });



})();
