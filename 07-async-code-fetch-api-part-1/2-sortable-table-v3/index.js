import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  sorted = {};
  start = 0;
  step = 20;
  end = this.start + this.step;
  loading = false;
  data = null;

  onWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;

    if (bottom < document.documentElement.clientHeight && !this.loading && !this.isSortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.loadData(id, order, this.start, this.end);

      this.updateRows(data);

      this.loading = false;
    }
  };

  constructor(header, {
    url
  } = {}, 
  isSortLocally = false
  ) {
    this.headerConfig = header;
    this.url = new URL(url, BACKEND_URL); 
    this.sorted = {
      id: header.find(item => item.sortable).id,
      order: 'asc',
    };
    this.isSortLocally = isSortLocally;
    // this.data = data;
    // this.sorted = sorted;

    this.render();
    this.updateComponent();
    // this.sort(this.sorted.id, this.sorted.order);
    this.initEventListeners();
  }

  async updateComponent() {
    // this.element.firstElementChild.classList.add('column-chart_loading');

    const data = await this.loadData(this.sorted.id, this.sorted.order, this.start, this.end);
    if (data && Object.values(data).length) {
      this.subElements.body.innerHTML = this.renderTableRow(data);
      // this.element.firstElementChild.classList.remove('column-chart_loading');
    }
   
    // return data;
  }

  updateRows = (data) => {
    const newData = [...this.data, ...data];
    this.data = newData;

    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = this.renderTableRow(data);
    this.subElements.body.append(...tempContainer.childNodes);
  }

  async loadData(id, order, start = this.start, end = this.end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    this.element.classList.add('sortable-table_loading');

    const data = await fetchJson(this.url);

    this.element.classList.remove('sortable-table_loading');

    return data;
  }

  sortOnClient (id, order) {
    const sortedData = this.sortData(id, order);
    this.subElements.body.innerHTML = this.renderTableRow(sortedData);
  }

  async sortOnServer (id, order) {
    const data = await this.loadData(id, order, this.start, this.end);

    // this.renderRows(data);
    this.subElements.body.innerHTML = this.renderTableRow(data);
  }


  onHeaderClick = (event) => {
    let td = event.target.closest(('.sortable-table__cell'));
    let { id, order } = td.dataset;
    let sortOrder = (order === 'desc' || !order) ? 'asc' : 'desc';
    this.sorted = {
      id,
      order: sortOrder
    };

    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${id}"]`);
    // NOTE: Remove sorting arrow from other columns
    allColumns.forEach(column => {
      column.dataset.order = '';
    });
    currentColumn.dataset.order = sortOrder;

    if (this.isSortLocally) {
      this.sortOnClient(id, sortOrder);
      return;
    }
    this.sortOnServer(id, sortOrder);
  }

  initEventListeners() {
    this.subElements.header.addEventListener("click", this.onHeaderClick);

    window.addEventListener('scroll', this.onWindowScroll);

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
    if (!data?.length) {
      this.element.classList.add('sortable-table_empty');
      return;
    }

    this.element.classList.remove('sortable-table_empty');
    this.data = data;
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
            ${this.data?.length && this.renderTableRow(this.data)}
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
    window.removeEventListener('scroll', this.onWindowScroll);
    this.remove();
    this.element = null;
    this.subElements = {};
  }


}
