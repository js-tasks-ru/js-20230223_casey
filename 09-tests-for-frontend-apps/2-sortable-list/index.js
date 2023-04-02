export default class SortableList {
    element;
    pointerShift;
    dragElement;
    elementInitialIndex;

    constructor({ items }) {
      this.items = items;

      this.render();
    }

    getTemplate() {
      return `<ul class="sortable-list"></ul>`;
    }

    render() {
      const tempWrapper = document.createElement('div');
      tempWrapper.innerHTML = this.getTemplate();
      const element = tempWrapper.firstElementChild; 
      this.element = element;

      this.addItems();
      this.initEventListeners();
    }

    addItems() {
      for (const item of this.items) {
        item.classList.add('sortable-list__item');
      }
      
      this.element.append(...this.items);
    }

    initEventListeners () {
      this.element.addEventListener('pointerdown', event => {
        this.onPointerDown(event);
      });
    }

    onPointerDown(event) {
      const el = event.target.closest('.sortable-list__item');

      if (!el) {
        return;
      }

      if (event.target.closest('[data-delete-handle]')) {
        event.preventDefault();
        el.remove();
        return;
      }

      event.preventDefault();
      el.ondragstart = function() {
        return false;
      };

      this.dragElement = el;
      this.elementInitialIndex = [...this.element.children].indexOf(el);
      this.startDrag(el, event.clientX, event.clientY);
    }

    createPlaceholderElement (width, height) {
      const element = document.createElement('li');
    
      element.className = 'sortable-list__placeholder';
      element.style.width = `${width}px`;
      element.style.height = `${height}px`;
    
      return element;
    }

    onMouseMove = ({ clientX, clientY }) => {
      this.moveDraggingAt(clientX, clientY);
        
      const prevElem = this.placeholderElement.previousElementSibling;
      const nextElem = this.placeholderElement.nextElementSibling;
    
      const { firstElementChild, lastElementChild } = this.element;
      const { top: firstElementTop } = firstElementChild.getBoundingClientRect();
      const { bottom } = this.element.getBoundingClientRect();
    
      if (clientY < firstElementTop) {
        return firstElementChild.before(this.placeholderElement);
      }
    
      if (clientY > bottom) {
        return lastElementChild.after(this.placeholderElement);
      }
    
      if (prevElem) {
        const { top, height } = prevElem.getBoundingClientRect();
        const middlePrevElem = top + height / 2;
    
        if (clientY < middlePrevElem) {
          return prevElem.before(this.placeholderElement);
        }
      }
    
      if (nextElem) {
        const { top, height } = nextElem.getBoundingClientRect();
        const middleNextElem = top + height / 2;
    
        if (clientY > middleNextElem) {
          return nextElem.after(this.placeholderElement);
        }
      }
    }

    onMouseUp = (event) => {
      const placeholderIndex = [...this.element.children].indexOf(this.placeholderElement);

      this.dragElement.style.cssText = '';
      this.dragElement.classList.remove('sortable-list__item_dragging');
      this.placeholderElement.replaceWith(this.dragElement);
      this.dragElement = null;

      document.removeEventListener('pointerup', this.onMouseUp);
      document.removeEventListener('pointermove', this.onMouseMove);
  
      if (placeholderIndex !== this.elementInitialIndex) {
        this.element.dispatchEvent(new CustomEvent('sortable-list-reorder', {
          bubbles: true,
          details: {
            from: this.elementInitialIndex,
            to: placeholderIndex,
          }
        }));
      }
    }

    startDrag(dragElement, clientX, clientY) {
      this.pointerShift = {
        x: clientX - dragElement.getBoundingClientRect().x,
        y: clientY - dragElement.getBoundingClientRect().y
      };

      this.dragElement.style.width = `${dragElement.offsetWidth}px`;
      this.dragElement.style.height = `${dragElement.offsetHeight}px`;

      this.dragElement.classList.add('sortable-list__item_dragging');
      this.placeholderElement = this.createPlaceholderElement(dragElement.offsetWidth, dragElement.offsetHeight);
      
      this.dragElement.after(this.placeholderElement);
      this.element.append(this.dragElement);

      this.moveDraggingAt(clientX, clientY);
    
      document.addEventListener('pointermove', this.onMouseMove);
      document.addEventListener('pointerup', this.onMouseUp);
    }

    moveDraggingAt(clientX, clientY) {
      this.dragElement.style.top = `${clientY - this.pointerShift.y}px`;
    }
}
