export default class Trello {
    constructor(container) {
        this.container = container

        this.showForm = this.showForm.bind(this);
        this.container.addEventListener('click', e => {
            if (e.target.classList.contains('add-card')) {
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
                                <div class="menu popup-menu">
                                    <div class="menu-item"></div>
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
        const bottomContent = e.currentTarget
        const item = bottomContent.closest(".item")
        console.log(item);

        e.target.style.display = "none"
        bottomContent.querySelector(".popup").style.display = "flex"

        bottomContent.querySelector(".input-addcard").addEventListener("change", () => this.addCardToHTML(item))
        bottomContent.querySelector("button").addEventListener("click", () => this.addCardToHTML(item))
    }

    addCardToHTML(item) {
        const value = item.querySelector(".input-addcard").value.trim()
        console.log(value);
    }
}
