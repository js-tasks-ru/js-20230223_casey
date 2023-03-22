import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
    element;
    data = null;
    isLoading = false;

    constructor({
      url = '',
      range = null,
      label = '',
      formatHeading = data => data,
      link = '',
    }) {
      this.url = url;
      this.range = range;
      this.label = label;
      this.formatHeading = formatHeading;
      this.link = link;

      this.render();

    }

    async loadData() {
      this.isLoading = true;
      const data = await fetchJson(`${BACKEND_URL}/${this.url}?from=${this.range.from}&to=${this.range.to}`, this.range);
      console.log(data);
      this.data = data;
      this.isLoading = false;
      if(!this.isLoading) {
        this.render();
      }
    }

    update(from, to) {
      this.range = {
        from,
        to,
      };
      this.loadData();
    }

    getItems() {
        if(!this.data || this.isLoading) {
          return '';
        }

        return Object.entries(this.data)?.map(item => `<div style="--value: ${item[1]}" data-tooltip="25%"></div>`).join('');
    }

    getTemplate() {
      return `
      <div class="dashboard__chart_${this.label}">
      <div class="column-chart ${this.isLoading ? `column-chart_loading` : ''}" style="--chart-height: 50">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.link && `<a href="${this.link}" class="column-chart__link">View all</a>`}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">$243,437</div>
          <div data-element="body" class="column-chart__chart">
            ${this.getItems()}
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
    }


}
