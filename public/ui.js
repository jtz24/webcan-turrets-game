class Button {
    constructor(x, y, w, h, text, color, hoverColor) {
        this.rect = { x, y, w, h };
        this.text = text;
        this.color = color;
        this.hoverColor = hoverColor;
    }

    draw(container) {
        const buttonElement = document.createElement('button');
        buttonElement.textContent = this.text;
        buttonElement.style.position = 'absolute';
        buttonElement.style.left = `${this.rect.x}px`;
        buttonElement.style.top = `${this.rect.y}px`;
        buttonElement.style.width = `${this.rect.w}px`;
        buttonElement.style.height = `${this.rect.h}px`;
        buttonElement.style.backgroundColor = `rgb(${this.color.join(',')})`;
        buttonElement.style.color = `rgb(${COLORS.buttons.text.join(',')})`;
        buttonElement.style.border = 'none';
        buttonElement.style.cursor = 'pointer';
        buttonElement.style.zIndex = '1000'; // 添加这行，确保按钮在最上层

        buttonElement.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log(`Button ${this.text} clicked`); // 添加这行日志
            // 这里可以添加点击后的操作
        });

        container.appendChild(buttonElement);
    }

    isClicked(mousePos) {
        console.log('Button isClicked:', mousePos, this.rect); // 添加这行来调试
        return mousePos.x >= this.rect.x && mousePos.x <= this.rect.x + this.rect.w &&
               mousePos.y >= this.rect.y && mousePos.y <= this.rect.y + this.rect.h;
    }
}



class Dropdown {
    constructor(x, y, w, h, main, options) {
        this.rect = { x, y, w, h };
        this.main = main;
        this.options = options;
        this.selected = main;
        this.active = false;
    }

    draw(container) {
        const dropdownElement = document.createElement('div');
        dropdownElement.style.position = 'absolute';
        dropdownElement.style.left = `${this.rect.x}px`;
        dropdownElement.style.top = `${this.rect.y}px`;
        dropdownElement.style.width = `${this.rect.w}px`;
        dropdownElement.style.height = `${this.rect.h}px`;
        dropdownElement.style.backgroundColor = 'white';
        dropdownElement.style.border = '1px solid black';
        dropdownElement.style.cursor = 'pointer';

        const mainElement = document.createElement('div');
        mainElement.textContent = this.selected;
        mainElement.style.padding = '5px';
        dropdownElement.appendChild(mainElement);

        if (this.active) {
            const optionsContainer = document.createElement('div');
            optionsContainer.style.position = 'absolute';
            optionsContainer.style.top = `${this.rect.h}px`;
            optionsContainer.style.left = '0';
            optionsContainer.style.width = '100%';
            optionsContainer.style.backgroundColor = 'white';
            optionsContainer.style.border = '1px solid black';

            this.options.forEach(option => {
                const optionElement = document.createElement('div');
                optionElement.textContent = option;
                optionElement.style.padding = '5px';
                optionElement.style.cursor = 'pointer';
                optionElement.addEventListener('click', () => {
                    this.selected = option;
                    this.active = false;
                    container.removeChild(dropdownElement);
                    this.draw(container);
                });
                optionsContainer.appendChild(optionElement);
            });

            dropdownElement.appendChild(optionsContainer);
        }

        mainElement.addEventListener('click', () => {
            this.active = !this.active;
            container.removeChild(dropdownElement);
            this.draw(container);
        });

        container.appendChild(dropdownElement);
    }

    handleClick(x, y) {
        if (x >= this.rect.x && x <= this.rect.x + this.rect.w &&
            y >= this.rect.y && y <= this.rect.y + this.rect.h) {
            this.active = !this.active;
            return null;
        }

        if (this.active) {
            const optionHeight = this.rect.h;
            for (let i = 0; i < this.options.length; i++) {
                if (x >= this.rect.x && x <= this.rect.x + this.rect.w &&
                    y >= this.rect.y + (i + 1) * optionHeight && y <= this.rect.y + (i + 2) * optionHeight) {
                    this.selected = this.options[i];
                    this.active = false;
                    return this.selected;
                }
            }
            this.active = false;
        }
        return null;
    }
}

class InputBox {
    constructor(x, y, w, h, defaultText) {
        this.rect = { x, y, w, h };
        this.text = defaultText;
        this.active = false;
    }

    draw(container) {
        console.log('Drawing input box'); 
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.value = this.text;
        inputElement.style.position = 'absolute';
        inputElement.style.left = `${this.rect.x}px`;
        inputElement.style.top = `${this.rect.y}px`;
        inputElement.style.width = `${this.rect.w}px`;
        inputElement.style.height = `${this.rect.h}px`;
        inputElement.style.fontSize = '16px';
        inputElement.style.padding = '5px';
        inputElement.style.border = '2px solid white';
        inputElement.style.borderRadius = '5px';
        inputElement.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        inputElement.style.color = 'white';
        
        inputElement.addEventListener('focus', () => {
            this.active = true;
            if (this.text === 'Enter User ID') {
                inputElement.value = '';
            }
        });
        
        inputElement.addEventListener('blur', () => {
            this.active = false;
            if (inputElement.value === '') {
                inputElement.value = 'Enter User ID';
            }
        });
        
        inputElement.addEventListener('input', (event) => {
            this.text = event.target.value;
        });
        
        container.appendChild(inputElement);
        console.log('Input box drawn'); 
    }

    handleClick(x, y) {

    }

    handleKeyPress(key) {

    }
}


