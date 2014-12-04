> I want the talk to take inspiration from [Bret Victor](http://worrydream.com/#!/ExplorableExplanations).
>
> When I rewrite this, I want to get rid of _all_ the rhetorical questions, and then only re-add them if I can get them to sound really good. I tend to rely on them too much.

# Functional Reactive Programming.

What is it? Well, obviously it's got "Functional Programming" right in the name, which I'm sure at least some of you have strong opinions about. Functional programming can have a bit of an academic feel to it, especially if you've read any technical articles on Lisp, or have done pretty much anything in Haskell. In addition, for most of computing history, procedural programming has been the _de facto_ norm. If you're accustomed to working in Java or Assembly, writing a program with immutable variables can feel like conducting a symphony with your hands tied.

However, it's 2014, and real-time apps have a lot to benefit from functional programming.

In this talk, I will:

 * Briefly describe functional reactive programming
 * Describe when you may or may not want to use FRP
 * Introduce basic functional reactive programming concepts using Bacon.js
 * Describe how to combine Bacon.js and Backbone to maximum effect, and
 * Demonstrate the creation of a web-based chat app using Bacon.js and Backbone.

## Briefly describe functional reactive programming

FRP, in essence, can be summed up in two words: *Immutable Streams*.

What are those? Well, _streams_ are pretty straightforward: a stream is a series of related events and errors that may terminate. Here's an example:

    --a---b-c---d--------->

> Maybe it should be something with a more straightforward concept of "error" and "end" than keyboard events. I'll think about it.

This is a stream of keypresses. Each stroke on my keyboard generates a keypress event which gets added to the stream. Just for argument's sake, let's say we could detect some sort of keyboard error; maybe it's a key code that the OS doesn't recognize, or perhaps we've spilled soda onto the keyboard and it shorted out.

    ----------X----------->

Finally, streams can end. This might be a bit of a stretch for our keyboard example, but let's say we could detect that the keyboard has been unplugged.

    ----------|

Immutable just means that you can't inject or remove events from an immutable stream once it's created. The only operations you can perform on streams are those that return a whole new stream.

## Describe when you may or may not want to use FRP

> Go over this later. I need some good reasons why *not* to use FRP or I'm going to sound like a fanboy idiot.

As I alluded to before, immutability can restrict you. State is generally maintained as an object that gets recreated each time instead of modified, so for some _blah blah blah..._

However, FRP especially shines in the UI. Bacon.js is particularly useful when you're polishing up the user experience and working on the final 20% that it takes to make your good app into a great app.

> Perhaps here I can display an 80% app and a 20% app; e.g., OpenMBTA side-by-side with Transit.

## Introduce basic functional reactive programming concepts using Bacon.js

Assuming you've got this far and still want to use FRP...

I mentioned earlier how you can't modify a stream in progress, you can only perform operations on streams to get new ones. So what are these operations? If you've used Underscore or Lo-Dash (which, this is a Backbone conference, so you're all familiar with one or the other) then you can think of these operations as just real-time equivalents of Lo-Dash functions.

First of all is the familiar `map()` function:

    --------a-----b---c---e------->
    vvvv   map(isVowel?1:0)    vvvv
    --------1-----0---0---e------->

Pretty straightforward. We also get two reduce functions to play with. One is called `scan` and operates in realtime:

    --------1----2---------3--4--->
    vvvvvvv   .scan(+)   vvvvvvvvvv
    --------1----3---------6--10-->

The other is called `reduce` and only emits the final value, at stream exit.

    --------1----2------3--4----|
    vvvvvvv   .reduce(+)   vvvvvvvvvv
    ----------------------------10-|

There are a few functions that let you combine streams as well. 

> Describe `merge()`, `zip()`, and `combine()`. Also make *absolutely sure* that any functions used in the demo are described here beforehand.

> Also describe `flatMap()`.

## Describe how to combine Bacon.js and Backbone to maximum effect, and

## Demonstrate the creation of a web-based chat app using Bacon.js and Backbone.

-------------------------

# Thoughts on the app structure

The server will generate a handful of fake users who will periodically join/leave, type, send messages, and update their statuses. 
Chat content and statuses will be [some form of lorem ipsum](http://hipsum.co/?paras=80&type=hipster-latin).

The server will run based on polling so we can demonstrate `flatMap()`. Yeah, it's contrived, but I want the example.

* **GET** `/api/messages?since=<timestamp>` -- fetches messages sent to the server since the given time
* **GET** `/api/user-events?since=<timestamp>` -- fetches user joins/leaves and statuses
* **POST** `/api/message` `<message text>` -- post a message
* **POST** `/api/typing` -- tell the server that the user is typing
* **POST** `/api/status` `<status text>` -- update status
