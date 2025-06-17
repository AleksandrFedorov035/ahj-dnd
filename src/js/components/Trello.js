export default class Trello {
    constructor(container) {
        this.container = container;

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
        this.container.addEventListener("click", (e) => {
            if (e.target.classList.contains("add-card")) {
                e.target.style.display = "none";
                e.target.style.display = "none";
                this.showForm(e);
            }
        });
    }

    renderHTML() {
        return `
            <div class="trello">
            ${["TODO", "In Progress", "DONE"]
                .map((status) => {
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
                </div>`;
                })
                .join("")}
        `;
    }

    renderItemsToContainer() {
        this.container.insertAdjacentHTML("beforeend", this.renderHTML());
    }

    renderCard(text) {
        return `
            <div class="element">
                <p>${text}</p>
                    <div class="close">
                        <div class="close-element"></div>
                    </div>
            </div>
        `;
    }

    showForm(e) {
        const item = e.target.closest(".item");
        const popup = item.querySelector(".popup");
        popup.style.display = "flex";

        if (this.inputFieldHandler)
            popup
                .querySelector(".input-addcard")
                .removeEventListener("keyup", this.inputFieldHandler);
        if (this.buttonClickHandler)
            popup
                .querySelector("button")
                .removeEventListener("click", this.buttonClickHandler);

        this.inputFieldHandler = (e) => {
            if (e.code === "Enter") {
                this.addCardToHTML(item);
            }
        };
        this.buttonClickHandler = () => this.addCardToHTML(item);

        popup
            .querySelector(".popup-close")
            .addEventListener("click", () => this.closeForm(item));
        popup
            .querySelector("button")
            .addEventListener("click", this.buttonClickHandler);
        popup
            .querySelector(".input-addcard")
            .addEventListener("keyup", this.inputFieldHandler);
    }

    closeForm(item) {
        item.querySelector(".popup").style.display = "none";
        item.querySelector(".add-card").style.display = "block";
        item.querySelector(".input-addcard").value = "";
    }

    addCardToHTML(item) {
        const value = item.querySelector(".input-addcard").value.trim();
        if (!value) return;

        const mainContent = item.querySelector(".main-content");

        const existingCards = Array.from(mainContent.children);
        const duplicateFound = existingCards.some(
            (card) => card.querySelector("p").innerText === value,
        );
        const error = item.querySelector(".errorMessage");
        if (duplicateFound) {
            if (error) return;
            const errorMessage =
                '<p style="color: red;" class="errorMessage">Карточка с таким текстом уже существует!</p>';
            item
                .querySelector(".popup")
                .insertAdjacentHTML("afterbegin", errorMessage);
            return;
        }
        if (error) error.remove();

        const newElement = this.renderCard(value);
        mainContent.insertAdjacentHTML("beforeend", newElement);

        item.querySelector(".input-addcard").value = ''

        const lastAddedCard = mainContent.lastElementChild;
        lastAddedCard
            .querySelector(".close")
            .addEventListener("click", () => this.removeCard(lastAddedCard));
        lastAddedCard.addEventListener("mousedown", (e) => this.onMouseDown(e));
    }

    removeCard(element) {
        element.remove();
    }

    onMouseDown(e) {
        e.preventDefault();
        console.log("onMouseDown:", e.currentTarget);
        if (e.target.classList.contains("close")) return

        this.actualElement = e.currentTarget;

        this.placeholder = document.createElement("div");
        this.placeholder.classList.add("placeholder");
        const rect = this.actualElement.getBoundingClientRect();
        this.placeholder.style.height = rect.height + "px";
        this.actualElement.parentNode.insertBefore(
            this.placeholder,
            this.actualElement.nextSibling,
        );

        this.shiftX = e.clientX - rect.left;
        this.shiftY = e.clientY - rect.top;

        this.actualElement.classList.add("dragged")
        this.actualElement.style.left = `${e.clientX - this.shiftX}px`;
        this.actualElement.style.top = `${e.clientY - this.shiftY}px`;

        document.body.appendChild(this.actualElement);

        document.addEventListener("mousemove", this.onMouseMove);
        document.addEventListener("mouseup", this.onMouseUp);
    }

    onMouseMove(e) {
        console.log("onMouseMove:", e.clientX, e.clientY);

        this.actualElement.style.left = `${e.clientX - this.shiftX}px`;
        this.actualElement.style.top = `${e.clientY - this.shiftY}px`;

        this.actualElement.hidden = true;
        let targetElement = document.elementFromPoint(e.clientX, e.clientY); if (!targetElement) return;
        this.actualElement.hidden = false;
        let targetColumn = targetElement.closest(".main-content"); if (!targetColumn) return;

        if (targetElement.classList.contains("element")) {
            const rect = targetElement.getBoundingClientRect()
            const middleY = rect.top + rect.height / 2;
            if (e.clientY > middleY) {
                targetColumn.insertBefore(this.placeholder, targetElement)
            } else {
                targetColumn.insertBefore(this.placeholder, targetElement.nextSibling)
            }
        }

        if (this.placeholder && this.placeholder.parentNode !== targetColumn) {
            targetColumn.appendChild(this.placeholder);
        }
    }

    onMouseUp(e) {
        console.log("onMouseUp:", e.clientX, e.clientY);

        document.removeEventListener("mousemove", this.onMouseMove);
        document.removeEventListener("mouseup", this.onMouseUp);

        this.actualElement.classList.remove("dragged")
        this.actualElement.style.left = "";
        this.actualElement.style.top = "";

        if (this.placeholder) {
            this.placeholder.parentNode.insertBefore(this.actualElement, this.placeholder);
            this.placeholder.parentNode.removeChild(this.placeholder);
            this.placeholder = null;
        }

        this.actualElement = null;
    }
}
