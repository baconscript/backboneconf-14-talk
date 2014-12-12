;(function(){

  var Model = Backbone.Model.extend({
    sync: function(method, model, options){
      var stream = Bacon.fromPromise(
        Backbone.sync.apply(this,arguments)
      );
      this.registerSyncStream(stream);
      return stream;
    },
    // TODO: do I need registerSyncStream?
    registerSyncStream: function(stream, options){
      this.trigger('request', this, stream, options);
      stream.onValue((function(v){
        this.trigger('sync', this, v, options);
      }).bind(this));
      stream.onError((function(err){
        this.trigger('error', this, err, options);
      }).bind(this));
      return stream;
    }
  });

  var Collection = Backbone.Collection.extend({
    sync: function(){
      return Bacon.fromPromise(
        Backbone.sync.apply(this,arguments)
      );
    }
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



});
