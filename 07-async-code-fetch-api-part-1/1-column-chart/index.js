import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
    chartHeight = 50;
    element;
    data = null;
    isLoading = false;
    subElements = {};
    url = '';

    constructor({
      url = '',
      range = { 
        from: new Date(), 
        to: new Date(),
      },
      label = '',
      formatHeading = data => data,
      link = '',
    }) {
      this.url = new URL(url, BACKEND_URL); 
      this.range = range;
      this.label = label;
      this.formatHeading = formatHeading;
      this.link = link;

      this.render();
      this.update();

    }

    async loadData() {
      this.url.searchParams.set('from', this.range.from.toISOString());
      this.url.searchParams.set('to', this.range.to.toISOString());
      this.isLoading = true;
      const data = await fetchJson(this.url);
      console.log(data);
      this.data = data;
      this.isLoading = false;
      return data;
    }

    async update(from = new Date(), to = new Date()) {
      this.element.firstElementChild.classList.add('column-chart_loading');
      this.range = {
        from,
        to,
      };
      const data = await this.loadData();
      if (data && Object.values(data).length) {
        this.subElements.header.textContent = this.getHeaderValue(data);
        this.subElements.body.innerHTML = this.getItems(data);
        this.element.firstElementChild.classList.remove('column-chart_loading');
      }
     
      return data;
    }

    getHeaderValue(data) {
      return this.formatHeading(Object.values(data).reduce((accum, item) => (accum + item), 0));
    }

    getItems(data = null) {
      if (!data || this.isLoading) {
        return '';
      }

      const maxValue = Math.max(...Object.values(data));


      return Object.entries(data)
                .map(([key, value]) => {
                  const scale = this.chartHeight / maxValue;
                  const percent = (value / maxValue * 100).toFixed(0);
                    
                  return `<div style="--value: ${Math.floor(value * scale)}" data-tooltip="${percent}%"></div>`;   
                }).join('');
    }

    getTemplate() {
      return `
      <div class="dashboard__chart_${this.label}">
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.link && `<a href="${this.link}" class="column-chart__link">View all</a>`}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">$243,437</div>
          <div data-element="body" class="column-chart__chart"></div>
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

    getSubElements(element) {
      const result = {};
      const elements = element.querySelectorAll('[data-element]');
    
      for (const subElement of elements) {
        const name = subElement.dataset.element;
        result[name] = subElement;
      }
    
      return result;
    }

    destroy() {
        this.element.remove();
    }


}
