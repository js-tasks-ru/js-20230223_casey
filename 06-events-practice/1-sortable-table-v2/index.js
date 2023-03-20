export default class SortableTable {
  element;
  subElements = {};
  sorted = {};

  constructor(headerConfig, {
    data = [],
    sorted = {}
  } = {}, 
  isSortLocally = true) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;

    this.render();
    this.sort(this.sorted.id, this.sorted.order);
    this.initEventListeners();
  }

  onHeaderClick = (event) => {
    let td = event.target.closest(('.sortable-table__cell'));
    let { id, order } = td.dataset;
    let sortOrder = (order === 'desc' || !order) ? 'asc' : 'desc';
    this.sort(id, sortOrder);
  }

  initEventListeners() {
    this.subElements.header.addEventListener("click", this.onHeaderClick);

  }

  renderHeader() {
    return this.headerConfig.map(item => {
      return `<div class="sortable-table__cell" data-id="${item.id}" data-sortable={${item.sortable}} data-order="asc">
        <span>${item.title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>`;
    }).join('');
  }

  renderCells(product) {
    return this.headerConfig.map(({id, template}) => {
      return template 
        ? template(product[id]) 
        : `<div class="sortable-table__cell">${product[id]}</div>`;
    }).join('');
  }

  renderTableRow(data = []) {
    return data.map(item => {
      return `
      <a href="/products/${item.id}" class="sortable-table__row">
        ${this.renderCells(item)}
      </a>`;
    }).join('');
  }

  getTemplate() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.renderHeader()}
          </div>
          <div data-element="body" class="sortable-table__body">
            ${this.renderTableRow(this.data)}
          </div>
          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
          </div>
        </div>
      </div>
  `;
  }

  render() {
    const tempWrapper = document.createElement('div');
    tempWrapper.innerHTML = this.getTemplate();
    const element = tempWrapper.firstElementChild; 
    this.element = element;

    this.subElements = this.getSubElements(element);
  }

  sort(field, order) {
    const sortedData = this.sortData(field, order);
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);

    // NOTE: Remove sorting arrow from other columns
    allColumns.forEach(column => {
      column.dataset.order = '';
    });

    currentColumn.dataset.order = order;

    this.subElements.body.innerHTML = this.renderTableRow(sortedData);
  }

  sortData(field, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find(item => item.id === field);
    const { sortType } = column;

    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];

    return arr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[field] - b[field]);
      case 'string':
        return direction * a[field].localeCompare(b[field], ['ru', 'en']);
      default:
        throw new Error(`Unknown type ${sortType}`);
      }
    });
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }

}

