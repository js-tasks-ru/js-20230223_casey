export default class ColumnChart {
    chartHeight = 50;

    constructor({ data = [], label = '', value = 0, link = '', formatHeading = null } = {}) {
      this.data = data;
      this.label = label;
      this.value = value;
      this.link = link;
      this.formatHeading = formatHeading;

      this.render();
    }

    update(newData) {
      this.data = newData;
      this.render();
    }

    renderHeader() {
      if (!this.formatHeading) {
        return this.value;
      }

      return this.formatHeading(this.value);
    }

    renderChartItems() {
      if (!this.data || this.data.length === 0) {
        return `<Image src="./charts-skeleton.svg" />`;
      }

      const maxValue = Math.max(...this.data);
      const scale = this.chartHeight / maxValue;

      return this.data.map(item => {
        const percent = (item / maxValue * 100).toFixed(0) + '%';
        const value = String(Math.floor(item * scale));

        return `<div style="--value: ${value}" data-tooltip=${percent}></div>`;
      }).join('');
    }

    getLoadingClass() {
      return (this.data?.length > 0) ? "" : "column-chart_loading";
    }

    getTemplate() {
      return `
        <div class="column-chart ${this.getLoadingClass()}" style="--chart-height: ${this.chartHeight}">
            <div class="column-chart__title">
                ${this.label}
                ${this.link && `<a href="/${this.link}" class="column-chart__link">View all</a>`}
            </div>
            <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">${this.renderHeader()}</div>
                <div data-element="body" class="column-chart__chart">
                    ${this.renderChartItems()}
                </div>
            </div>
        </div>
    `;
    }

    render() {
      const tempWrapper = document.createElement('div');
      tempWrapper.innerHTML = this.getTemplate();
      this.element = tempWrapper.firstElementChild; 
    }

    remove() {
      this.element.remove();
    }

    destroy() {
      this.remove();
    // NOTE: удаляем обработчики событий, если они есть
    }

}
