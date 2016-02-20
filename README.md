# es6terminal

## About

A multipurpose terminal written in pure es6/css3.

[![Screenshot of es6terminal](https://senritsu.github.io/es6terminal/images/screenshot_01.png)](http://senritsu.github.io/es6terminal)

The terminal can be used as an interface for async communication with a server, or for pure javascript applications.

The project was inspired by [terminaljs](https://github.com/eosterberg/terminaljs)

## Demo

Demo available at http://senritsu.github.io/es6terminal

## Description

### Initialization

```javascript
var terminal = new Terminal(queryString)
var terminal = new Terminal('#some-id')
var terminal = new Terminal('.some-class')
```

Creates a new terminal hosted in the specified element. The terminal will fill the element completely.

### Prompts

```javascript
terminal.prompt()
terminal.prompt(options)
```
The user is prompted for input, returning a promise. The promise is resolved with the output of the handler function.

```javascript
terminal.prompt().then(doSomethingElse).catch(handleErrors)
terminal.prompt().then((output) => console.log(`prompt is completed, ${output} was written to the terminal.`))
```

The promise is resolved after the user input is submitted, input handlers are finished and the output was written to the terminal.

```javascript
terminal.startInteractive()
terminal.startInteractive(options)
terminal.stopInteractive()
```

In interactive mode any completed user input will automatically followed by a new prompt.

`Ctrl-C` can be used to cancel a prompt or interactive mode.

### Prompt options

Prompts and interactive mode can be configured using an options object. The default options object looks like this:

```javascript
{
  message: '>>>',
  echoInput: true,
  handler: (input) => input
}
```

`message` is the text displayed for the prompt. An additional space will be added between the message and the user input.
`echoInput` controls if the user input including the prompt message is echoed back to the terminal on submit.
`handler` is an input handler to be used.

### Input handlers

An input handler takes the form `(input) => output`, where `input` is the text submitted by the user, and `output` is what should be written back to the terminal.

Input handlers can return promises for async processing.

The default input handler `(input) => input` writes a simple echo of the user input.

#### Special cases for output values

An empty string as output results in an empty line being written to the terminal. 

`null` or `undefined` will be ignored and nothing will be written to the terminal.

#### Builtin handler generators

There exist a number of generator functions for simplifying handlers, located in the `terminal.handlers` property.

```javascript
let echoHandler = terminal.handlers.echo()
```

Replicates the default behaviour of the terminal, included for completeness.

```javascript
let ajaxTextHandler = terminal.handlers.ajaxText(url)
```

Communication using content type `text/plain`. `POST`s the input to the given `url` endpoint and outputs the response text to the terminal.

```javascript
let ajaxJsonHandler = terminal.handlers.ajaxJson(url, inputToObject, objectToOutput)
```

Communication using content type `application/json`. `inputToObject` is expected to transform the input text to a plain javascript object. The object is serialized and sent to the given `url`. `objectToOutput` is expected to transform the response javascript object into text that should be written to the terminal.

Example:

```javascript
let inputToObject = (input) => ({ number: parseInt(input) })
// server calculates square of the number and sends it back as {number: x, square: y}
let objectToOutput = (response) => `${response.number} * ${response.number} = ${response.squared}`
let handler = terminal.handlers.ajaxJson('http://localhost:3000/api/square', inputToObject, objectToOutput)
terminal.prompt({message: 'type a number to be squared:', handler})
```

### Additional API methods

```javascript
terminal.write(text)
terminal.write(text, cssClass)
```

Append text to the end of the current line

```javascript
terminal.writeLine(text)
terminal.writeLine(text, cssClass)
terminal.writeLines(lineArray)
terminal.writeLines(lineArray, cssClass)
```

Add one or more lines to the terminal output.

`cssClass` will be used instead of the default class for any new lines, and can be used to override the default styling.

Unescaped `\n` characters in the text will split the text into multiple lines.

```javascript
terminal.scrollToBottom()
```

Scrolls to the bottom of the output.

```javascript
terminal.setTheme(theme)
```

Sets the color theme for the terminal. Valid values are `default`,`amber`, `green`, `c64` and `char-custom`.

```javascript
terminal.focus()
```

Focuses the terminal, enabling text input.

```javascript
terminal.finishInput(echo)
```

Cancels the current prompt or interactive mode. `true` for the `echo` parameter results in the current prompt and input being echoed to the terminal. Defaults to `false`.

## License

The MIT License (MIT)
Copyright (c) 2016 senritsu

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
