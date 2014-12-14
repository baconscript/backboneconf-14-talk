Message = Backbone.Model.extend
  send: -> $.post '/api/message', @get 'content'

ChatThread = Backbone.Collection.extend
  initialize: ->
    @lastSync = @asEventStream('request')
      .scan 0, -> +new Date()
    @poll = Bacon.interval 1000
    @lastSync.sampledBy @poll
      .map (time) -> "/api/messages?since=#{time}"
      .flatMap (url) ->
        Bacon.fromPromise $.getJSON(url)
      .flatMap (messages) ->
        Bacon.fromArray messages.map (json) ->
          new Message(json)
      .assign @, 'push'

EntryView = Backbone.View.extend
  render: ->
    html = """
    <div class="ui action small input" style="width: 100%;">
      <input type="text" placeholder="Type your message">
      <div class="ui primary button">Send</div>
    </div>
    """
    @$el.html(html).addClass('ui bottom attached label field')
      .css('padding',0)
    @keyStream = @$('input').asEventStream('keyup')
    @enterStream = @keyStream.filter (e) -> e.which is 13
    @sendStream = $('.button').asEventStream('click')
      .merge(@enterStream)
      .map => new Message(content:@$('input').val())
      .onValue (message) =>
        message.send()
        @$('input').val('')
    @

ChatThreadView = Backbone.View.extend
  initialize: (opt={}) ->
    {@collection} = opt
    @collection.asEventStream('add')
      .onValue (msg) =>

MessageView = Backbone.View.extend
  initialize: (opt={}) ->
    {@message} = opt
  render: ->
    html = """
    <div class="label"><img></div>
    <div class="content"></div>
    """
    @$el.addClass('event').html(html)
    # add event listeners here
    return @
