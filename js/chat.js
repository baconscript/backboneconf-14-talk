var ChatThread, ChatThreadView, EntryView, Message, MessageView;

Message = Backbone.Model.extend({
  send: function() {
    return $.post('/api/message', {message:this.get('content')});
  }
});

ChatThread = Backbone.Collection.extend({
  initialize: function() {
    this.lastSync = this.asEventStream('request').scan(0, function() {
      return +new Date();
    });
    this.poll = Bacon.interval(2000);
    return this.lastSync.sampledBy(this.poll).map(function(time) {
      return "/api/messages?since=" + time;
    }).flatMap(function(url) {
      this.trigger('request')
      return Bacon.fromPromise($.getJSON(url));
    }.bind(this)).flatMap(function(messages) {
      return Bacon.fromArray(messages.map(function(json) {
        return new Message(json);
      }));
    }).assign(this, 'push');
  }
});

EntryView = Backbone.View.extend({
  render: function() {
    var html;
    html = "<div class=\"ui action small input\" style=\"width: 100%;\">\n  <input type=\"text\" placeholder=\"Type your message\">\n  <div class=\"ui primary button\">Send</div>\n</div>";
    this.$el.html(html).addClass('ui bottom attached label field').css('padding', 0);
    this.keyStream = this.$('input').asEventStream('keyup');
    this.enterStream = this.keyStream.filter(function(e) {
      return e.which === 13;
    });
    this.sendStream = this.$('.button').asEventStream('click').merge(this.enterStream).map((function(_this) {
      return function() {
        return new Message({
          content: _this.$('input').val()
        });
      };
    })(this)).onValue((function(_this) {
      return function(message) {
        message.send();
        return _this.$('input').val('');
      };
    })(this));
    return this;
  }
});

ChatThreadView = Backbone.View.extend({
  initialize: function(opt) {
    if (opt == null) {
      opt = {};
    }
    this.collection = opt.collection;
    this.$el = $('<div>').css({
      position: 'absolute',
      top: '3px',
      bottom: '2.6rem',
      left: 0,
      right: 0,
      'overflow-y': 'scroll',
      'font-size': '14px',
      'padding-left':'4px',
      'padding-right':'4px'
    });
    setInterval(function(){this.$el.scrollTop(this.collection.size()*700);}.bind(this),200);
    return this.collection.asEventStream('add').onValue(function(message){
      this.$el.append(new MessageView({message:message}).render().$el.slideDown());
    }.bind(this));
  }
});

MessageView = Backbone.View.extend({
  initialize: function(opt) {
    if (opt == null) {
      opt = {};
    }
    this.message = opt.message;
  },
  render: function() {
    var html;
    html = "<div class=\"label\"><img style='float:left;max-width:50px;border-radius:50%;margin:3px;'></div>\n<div class=\"content\" style='color:black;'></div>";
    this.$el.addClass('event').html(html).css({
      clear: 'both',
      padding: '2px'
    });
    this.$('.content').text(this.message.get('content'));
    this.$('img').attr('src', '//robohash.org/u'+this.message.get('user').name+'?size=80x80&bgset=any');
    console.log('mvrend');
    return this;
  }
});
