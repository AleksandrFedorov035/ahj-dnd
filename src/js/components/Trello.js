export default class Trello {
    constructor(container) {
        this.container = container

        this.inputFieldHandler = null;
        this.buttonClickHandler = null;

        this.actualElement;

        this.showForm = this.showForm.bind(this);
        this.container.addEventListener('click', e => {
            if (e.target.classList.contains('add-card')) {
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
