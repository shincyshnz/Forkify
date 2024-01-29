import icons from 'url:../../img/icons.svg';

export default class View {
    _data;
    // Public
    render(data) {
        if (!data || (Array.isArray(data) && data.length === 0)) return this.renderError();

        this._data = data;
        const markup = this._generateMarkup();
        this._clear();
        this._parentElement.insertAdjacentHTML('afterbegin', markup);
    }

    update(data) {
        if (!data || (Array.isArray(data) && data.length === 0)) return this.renderError();

        this._data = data;
        const newMarkup = this._generateMarkup();

        const newDOM = document.createRange().createContextualFragment(newMarkup);
        const newElements = Array.from(newDOM.querySelectorAll('*'));
        const curElements = Array.from(this._parentElement.querySelectorAll('*'));

        newElements.forEach((newEl, i) => {
            const currEl = curElements[i];

            // Executed elemts with only text
            if (!newEl.isEqualNode(currEl) && newEl.firstChild?.nodeValue.trim() !== '') {
                currEl.textContent = newEl.textContent;
            }

            // updtaes changed attribute
            if (!newEl.isEqualNode(currEl)) {
                Array.from(newEl.attributes).forEach(attr =>
                    currEl.setAttribute(attr.name, attr.value)
                );
            }

        })
    }

    _clear() {
        this._parentElement.innerHTML = "";
    }

    // Public method
    renderSpinner() {
        const markup = `
            <div class="spinner">
                <svg>
                <use href="${icons}#icon-loader"></use>
                </svg>
            </div>`;
        this._clear();
        this._parentElement.insertAdjacentHTML('afterbegin', markup);
    }

    // Error handling
    renderError(message = this._errorMessage) {
        const markup = `<div class="error">
            <div>
                <svg>
                    <use href="${icons}#icon-alert-triangle"></use>
                </svg>
            </div>
            <p>${message}</p>
        </div>`;
        this._clear();
        this._parentElement.insertAdjacentHTML('afterbegin', markup);
    }

    renderMessage(message = this._message) {
        const markup = ` 
        <div class="message">
            <div>
            <svg>
                <use href="${icons}"></use>
            </svg>
            </div>
        <p>${message}</p>
        </div>`;
        this._clear();
        this._parentElement.insertAdjacentHTML('afterbegin', markup);
    }
}