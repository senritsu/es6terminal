'use strict';

class Terminal {
    constructor(host) {
        this.element = host
        this.interactive = false

        const node = (tag, cssClass, parent) => {
            const node = document.createElement(tag)
            if (cssClass) node.classList.add(cssClass)
            if (parent) parent.appendChild(node)
            return node
        }

        this.background = node('div', 'terminal-background', host)
        this.background.setAttribute('theme', 'default')
        this.input = node('input', null, this.background)
        this.scrollContainer = node('div', 'terminal-scroll', this.background)
        this.outputArea = node('p', 'terminal-output-area', this.scrollContainer)
        this.inputArea = node('p', 'terminal-input-area')
        this.userPrompt = node('span', null, this.inputArea)
        this.userInput = node('span', null, this.inputArea)
        this.inputCaret = node('span', 'terminal-caret', this.inputArea)

        this.input.setAttribute('type','text')
        this.inputCaret.textContent = 'C'

        this.background.addEventListener('click', (event) => { if(this.inputArea.parentNode) this.input.focus() })
        this.input.addEventListener('input', (event) => this.userInput.textContent = this.input.value)
        this.input.addEventListener('blur', (event) => this.inputCaret.classList.remove('blink'))
        this.input.addEventListener('focus', (event) => this.inputCaret.classList.add('blink'))
    }

    writeLine(text) {
        if (!text) return
        const div = document.createElement('div')
        div.textContent = text
        this.outputArea.appendChild(div)
    }

    write(text) {
        if (!text) return
        const lastLine = this.outputArea.lastElementChild
        if (!lastLine) {
            this.writeLine(text)
        }
        lastLine.textContent = lastLine.textContent + text
    }

    finishInput(echoInput) {
        this.scrollContainer.removeChild(this.inputArea)

        if (echoInput) {
            this.writeLine(this.userPrompt.textContent + this.input.value)
        }

        const userInput = this.input.value
        this.input.value = ''
        this.userInput.textContent = ''
        this.userPrompt.textContent = ''

        this.scrollToBottom()

        return userInput
    }

    get echoHandler() {
        return (text) => {
            this.writeLine(text)
        }
    }

    startInteractive(handler, echoInput) {
        this.interactive = true
        const loop = () => {
            this.prompt(echoInput)
            .then(handler)
            .then(() => { if (this.interactive) loop() })
        }
        loop()
    }

    stopInteractive() {
        this.finishInput()
        this.interactive = false
    }

    scrollToBottom() {
        this.background.scrollTop = this.scrollContainer.scrollHeight
    }

    prompt(echoInput) {
        if(echoInput == undefined) {
            echoInput = true
        }
        this.scrollContainer.appendChild(this.inputArea)
        this.userPrompt.textContent = '>>> '

        this.scrollToBottom()

        return new Promise((resolve, reject) => {
            const listener = (event) => {
                if (event.keyCode == 67 && event.ctrlKey) {
                    this.input.removeEventListener('keydown', listener)
                    this.finishInput(false)
                    reject("Keyboard Interrupt")
                }
                if (event.keyCode == 13) {
                    this.input.removeEventListener('keydown', listener)
                    resolve(this.finishInput(echoInput))
                }
            }
            this.input.addEventListener('keydown', listener)
        })
    }

    setTheme(theme) {
        this.background.setAttribute('theme', theme)
    }
}
