class Tooltip {
  element;
  static instance;

  costructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;

  }

  render(text) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = text;

    document.body.append(this.element);
  }

  onMouseOver = (event) => {
    let too = event.target.closest('[data-tooltip]');

    if (too) {
      this.render(too.dataset.tooltip);
      document.addEventListener('pointermove', this.onPointerMove);
    }
  }

  moveTooltip(event) {
    const shift = 10;
    const left = event.clientX + shift;
    const top = event.clientY + shift;

    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }

  onMouseOut = () => {
    if (this.element) { 
      this.remove(); 
    }
    document.removeEventListener('pointermove', this.onPointerMove);
  }

  onPointerMove = event => {
    this.moveTooltip(event);
  };

  initialize () {
    this.initEventListeners();
  }

  initEventListeners () {
    document.addEventListener("pointerover", this.onMouseOver);
    document.addEventListener("pointerout", this.onMouseOut);
  }

  removeEventListeners () {
    document.removeEventListener("pointerover", this.onMouseOver);
    document.removeEventListener("pointerout", this.onMouseOut);
    document.removeEventListener('pointermove', this.onPointerMove);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
    this.element = null;
  }
}

export default Tooltip;
