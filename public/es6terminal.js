'use strict';

const simpleExtendObject = (obj1, obj2) => {
    obj1 = obj1 || {}
    for(let key in obj2) {
        if (obj1[key] == undefined) {
            obj1[key] = obj2[key]
        }
    }
    return obj1
}

const echoHandlerFactory = () => (x) => x

const ajaxTextHandlerFactory = (url) => (input) => {
    return fetch(url, {
        method: 'POST',
        body: input,
        headers: {
            "Content-Type": "text/plain"
        }
    })
    .then((response) => response.text())
}

const ajaxJsonHandlerFactory = (url, inputToObject, objectToOutput) => (input) => {
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(inputToObject(input)),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then((response) => response.json())
    .then((object) => objectToOutput(object))
}

class Terminal {
    constructor(hostQueryString) {
        this.element = document.querySelector(hostQueryString)
        this.interactive = false
        this.autoscroll = true

        const node = (tag, cssClass, parent) => {
            const node = document.createElement(tag)
            if (cssClass) node.classList.add(cssClass)
            if (parent) parent.appendChild(node)
            return node
        }

        this.background = node('div', 'terminal-background', this.element)
        this.background.setAttribute('theme', 'default')
        this.input = node('input', null, this.background)
        this.scrollContainer = node('div', 'terminal-scroll', this.background)
        this.outputArea = node('p', 'terminal-output-area', this.scrollContainer)
        this.inputArea = node('p', 'terminal-input-area')
        this.userPrompt = node('span', 'terminal-prompt', this.inputArea)
        this.userInput = node('span', 'terminal-user-input', this.inputArea)
        this.inputCaret = node('span', 'terminal-caret', this.inputArea)

        this.input.setAttribute('type','text')
        this.inputCaret.textContent = 'C'

        this.background.addEventListener('click', (event) => { if(this.inputArea.parentNode) this.input.focus() })
        this.input.addEventListener('input', (event) => {
            this.userInput.textContent = this.input.value
            this.scrollToBottom()
        })
        this.input.addEventListener('blur', (event) => this.inputCaret.classList.remove('blink'))
        this.input.addEventListener('focus', (event) => this.inputCaret.classList.add('blink'))
    }

    writeLines(lines, cssClass) {
        for (var i = 0; i < lines.length; i++) {
            this.writeLine(lines[i], cssClass)
        }
    }

    writeLine(text, cssClass) {
        const scrollToBottom = this.background.scrollTop == this.scrollContainer.scrollHeight

        const lines = text.split('\n')
        text = lines[0] || '\u00A0'

        const div = document.createElement('div')
        div.classList.add(cssClass || 'terminal-output-line')
        div.textContent = text
        this.outputArea.appendChild(div)

        this.writeLines(lines.slice(1,lines.length))

        if (this.autoscroll) this.scrollToBottom()
    }

    write(text, cssClass) {
        const lines = text.split('\n')
        text = lines[0]

        const lastLine = this.outputArea.lastElementChild
        if (!lastLine) {
            this.writeLine(text, cssClass)
        }
        else{
            lastLine.textContent = lastLine.textContent + text
            if (this.autoscroll) this.scrollToBottom()
        }

        this.writeLines(lines.slice(1,lines.length), cssClass)
    }

    finishInput(echoInput) {
        this.input.removeEventListener('keydown', this.listener)
        this.listener = null
        this.scrollContainer.removeChild(this.inputArea)

        if (echoInput) {
            this.writeLine(this.userPrompt.textContent + this.input.value, 'terminal-input-feedback')
        }

        const userInput = this.input.value
        this.input.value = ''
        this.userInput.textContent = ''
        this.userPrompt.textContent = ''

        this.scrollToBottom()

        return userInput
    }

    get handlers() {
        return {
            echo: echoHandlerFactory,
            ajaxText: ajaxTextHandlerFactory,
            ajaxJson: ajaxJsonHandlerFactory
        }
    }

    startInteractive(options) {
        this.interactive = true

        const loop = () => {
            this.prompt(options)
            .then(() => { if (this.interactive) loop() })
        }
        loop()
    }

    stopInteractive() {
        if (this.interactive) {
            this.interactive = false
            this.finishInput(false)
        }
    }

    scrollToBottom() {
        this.background.scrollTop = this.scrollContainer.scrollHeight
    }

    setUserInput(input) {
        this.input.value = input
        this.userInput.textContent = input
    }

    prompt(options) {
        if (this.listener) {
            this.finishInput(false)
        }

        options = simpleExtendObject(options, {
            message:'>>>',
            echoInput: true,
            handler: (input) => input
        })

        this.scrollContainer.appendChild(this.inputArea)
        this.userPrompt.textContent = `${options.message}\u00A0`

        this.scrollToBottom()
        this.focus()

        return new Promise((resolve, reject) => {
            this.listener = (event) => {
                if (event.keyCode == 38) {
                    this.setUserInput('Not yet implemented: previous history entry')
                }
                if (event.keyCode == 40) {
                    this.setUserInput('Not yet implemented: next history entry')
                }
                if (event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 38 || event.keyCode == 40) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                if (event.keyCode == 67 && event.ctrlKey) {
                    this.finishInput(false)
                    this.writeLine('^C => Keyboard Interrupt')
                    reject("Keyboard Interrupt")
                }
                else if (event.keyCode == 13) {
                    const input = this.finishInput(options.echoInput)
                    const handlerMaybePromise = options.handler(input)
                    Promise.resolve(handlerMaybePromise)
                    .then((result) => {
                        if(result !== undefined && result !== null) this.writeLine(result)
                        return result
                    })
                    .then(resolve)
                }
            }
            this.input.addEventListener('keydown', this.listener)
        })
    }

    focus() {
        this.input.focus()
    }

    setTheme(theme) {
        this.background.setAttribute('theme', theme)
    }
}
