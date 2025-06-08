export default class Trello {
    constructor(container) {
        this.container = container;

        // Привяжем методы к экземпляру класса
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        this.actualElement = null;
        this.placeholder = null;
        this.shiftX = 0;
        this.shiftY = 0;

        this.inputFieldHandler = null;
        this.buttonClickHandler = null;

        this.actualElement;

        this.showForm = this.showForm.bind(this);
        this.container.addEventListener('click', e => {
            if (e.target.classList.contains('add-card')) {
                e.target.style.display = "none";
                e.target.style.display = "none"
                this.showForm(e);
            }
        });
    }

    renderHTML() {
        return `
            <div class="trello">
            ${['TODO', 'In Progress', 'DONE'].map(status => {
            return `
                <div class="item">
                    <div class="top-content">
                        <h1>${status}</h1>
                        <div class="menu">
                            <div class="menu-item"></div>
                        </div>
                    </div>
                    <div class="main-content"></div>
                    <div class="bottom-content">
                        <p class="add-card">+ Add another card</p>
                        <div class="popup">
                            <input type="text" placeholder="Введите текст для карточки" class="input-addcard" autofocus>
                            <div class="popup-add">
                                <button type="button">Add Card</button>
                                <div class="popup-close">
                                    <div class="popup-close-element"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`
        }).join('')}
        `
    }

    renderItemsToContainer() {
        this.container.insertAdjacentHTML("beforeend", this.renderHTML())
    }

    renderCard(text) {
        return `
            <div class="element">
                <p>${text}</p>
                    <div class="close">
                        <div class="close-element"></div>
                    </div>
            </div>
        `
    }

    showForm(e) {
        const item = e.target.closest(".item")
        const popup = item.querySelector(".popup")
        popup.style.display = "flex"

        if (this.inputFieldHandler) popup.querySelector(".input-addcard").removeEventListener('keyup', this.inputFieldHandler);
        if (this.buttonClickHandler) popup.querySelector("button").removeEventListener('click', this.buttonClickHandler);

        this.inputFieldHandler = e => {
            if (e.code === "Enter") {
                this.addCardToHTML(item);
            }
        }
        this.buttonClickHandler = () => this.addCardToHTML(item);

        popup.querySelector(".popup-close").addEventListener("click", () => this.closeForm(item))
        popup.querySelector("button").addEventListener('click', this.buttonClickHandler)
        popup.querySelector(".input-addcard").addEventListener('keyup', this.inputFieldHandler)
    }

    closeForm(item) {
        item.querySelector(".popup").style.display = "none"
        item.querySelector(".add-card").style.display = "block"
        item.querySelector(".input-addcard").value = ""
    }

    addCardToHTML(item) {
        const value = item.querySelector(".input-addcard").value.trim()
        if (!value) return

        const mainContent = item.querySelector(".main-content")

        const existingCards = Array.from(mainContent.children);
        const duplicateFound = existingCards.some(card => card.querySelector('p').innerText === value);
        const error = item.querySelector(".errorMessage")
        if (duplicateFound) {
            if (error) return
            const errorMessage = '<p style="color: red;" class="errorMessage">Карточка с таким текстом уже существует!</p>';
            item.querySelector(".popup").insertAdjacentHTML("afterbegin", errorMessage);
            return
        }
        if (error) error.remove()


        const newElement = this.renderCard(value)
        mainContent.insertAdjacentHTML("beforeend", newElement)

        const lastAddedCard = mainContent.lastElementChild;
        lastAddedCard.querySelector('.close').addEventListener('click', () => this.removeCard(lastAddedCard))
        lastAddedCard.addEventListener("mousedown", e => {
            if (e.target != lastAddedCard.querySelector('.close')) this.onMouseDown(e)
        })

    }

    removeCard(element) {
        element.remove()
    }

    onMouseDown(e) {
        e.preventDefault()
        console.log('onMouseDown:', e.currentTarget);
        this.actualElement = e.currentTarget;

        // Создание placeholder
        this.placeholder = document.createElement('div');
        this.placeholder.classList.add("placeholder")
        const rect = this.actualElement.getBoundingClientRect();
        this.placeholder.style.height = rect.height + "px"
        this.actualElement.parentNode.insertBefore(this.placeholder, this.actualElement.nextSibling);

        // Получаем начальное положение мыши относительно элемента
        this.shiftX = e.clientX - rect.left;
        this.shiftY = e.clientY - rect.top;

        // Меняем позицию карты на абсолютную
        this.actualElement.style.position = 'absolute';
        this.actualElement.style.zIndex = 1000;  // Поднимаем карту вверх
        this.actualElement.style.left = `${e.clientX - this.shiftX}px`;
        this.actualElement.style.top = `${e.clientY - this.shiftY}px`;

        // Переносим карточку в body для свободного перемещения
        document.body.appendChild(this.actualElement);

        // Устанавливаем глобальные события
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
    }

    onMouseMove(e) {
        console.log('onMouseMove:', e.clientX, e.clientY);
        // Позиция карточки за курсором
        this.actualElement.style.left = `${e.clientX - this.shiftX}px`;
        this.actualElement.style.top = `${e.clientY - this.shiftY}px`;

        // Определяем колонку под курсором
        let targetElement = document.elementFromPoint(e.clientX, e.clientY);
        if (!targetElement) return; // Если элемент не найден, прекращаем работу

        let targetColumn = targetElement.closest(".main-content");
        console.log("Target column:", targetColumn);

        if (!targetColumn || !targetColumn.classList.contains('main-content')) return;

        // Проверяем, поменялась ли колонка
        if (this.placeholder && this.placeholder.parentNode !== targetColumn) {
            targetColumn.appendChild(this.placeholder);
        }
    }

    onMouseUp(e) {
        console.log('onMouseUp:', e.clientX, e.clientY);
        // Очищаем событие
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);

        // Возвращаем карточку в исходный поток
        this.actualElement.style.position = '';
        this.actualElement.style.left = '';
        this.actualElement.style.top = '';
        this.actualElement.style.zIndex = '';

        // Удаляем placeholder
        if (this.placeholder) {
            const parentColumn = this.placeholder.parentNode;
            parentColumn.insertBefore(this.actualElement, this.placeholder);
            parentColumn.removeChild(this.placeholder);
            this.placeholder = null;
        }

        // Обнуляем ссылку на элемент
        this.actualElement = null;
        this.actualElement = e.target;

        this.actualElement.classList.add("dragged")

        document.documentElement.addEventListener('mouseup', e => this.onMouseUp(e));
        document.documentElement.addEventListener('mouseover', e => this.onMouseOver(e));
    }

    onMouseUp(e) {
        const mouseUpItem = e.target;

        this.actualElement.classList.remove('dragged');

        document.documentElement.removeEventListener('mouseup', e => this.onMouseUp(e));
        document.documentElement.removeEventListener('mouseover', e => this.onMouseOver(e));
    }

    onMouseOver(e) {
        this.actualElement.style.top = e.clientY + 'px';
        this.actualElement.style.left = e.clientX + 'px';
    }

}
