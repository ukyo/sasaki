# The MIT License
#
# Copyright (c) 2013 Syu Kato <ukyo@gmail.com>
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of
# this software and associated documentation files (the "Software"), to deal in
# the Software without restriction, including without limitation the rights to
# use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
# the Software, and to permit persons to whom the Software is furnished to do so,
# subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
# FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
# COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
# IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
# CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

sasaki = {}

do ->
  class Promise
    constructor: (@_deferred) ->
    then: (onResolved, onRejected) -> @_deferred._queue.push {onResolved, onRejected}; @
    done: (onResolved) -> @then onResolved
    fail: (onRejected) -> @then null, onRejected
    always: (callback) -> @then callback, callback


  class Deferred
    slice = [].slice

    constructor: ->
      @_queue = []
      @_context = null

    _transition: (isResolve, args) ->
      return unless @_queue.length
      current = @_queue.shift()
      handler = if isResolve then current.onResolved else current.onRejected
      return @_transition isResolve, args unless typeof handler is 'function'
      try
        result = handler.apply @_context, args
        if Deferred.isPromise result
          setContext = =>
            @_context = result._deferred._context if result._deferred?._context?
          onResolved = (args...) =>
            setContext()
            @resolve args...
          onRejected = (e) =>
            setContext()
            @reject e
          result.then onResolved, onRejected
        else
          @resolve result
      catch e
        @reject e

    resolve: => @_transition true, arguments
    resolveWith: (@_context, args...) => @_transition true, args
    reject: => @_transition false, arguments
    rejectWith: (@_context, args...) => @_transition false, args
    then: (onResolved, onRejected) -> @_queue.push {onResolved, onRejected}; @
    done: (onResolved) -> @then onResolved
    fail: (onRejected) -> @then null, onRejected
    always: (callback) -> @then callback, callback
    promise: -> new Promise @


  Deferred.isPromise = (x) ->
    x and typeof x.then is 'function'

  sasaki.defer = -> new Deferred
  sasaki.Deferred = Deferred
  sasaki.Promise = Promise

  sasaki.when = (args...) ->
    args = args[0] if args.length is 1 and Array.isArray args[0]
    dfd = new Deferred
    results = []
    count = args.length
    isError = false

    onResolved = (i, args) ->
      return if isError
      results[i] = if args.length is 1 then args[0] else args
      dfd.resolve.apply dfd, results unless --count

    onRejected = (e) ->
      return if isError
      isError = true
      dfd.reject e

    args.forEach (arg, i) ->
      if Deferred.isPromise arg
        arg.then ((args...) -> onResolved i, args), onRejected
      else
        onResolved i, arg

    dfd.promise()