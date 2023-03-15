export default class NotificationMessage {
  element;
  timerId;
  static currentNotif;

  constructor(text = '', {
    duration = 2000,
    type = 'success',
  } = {}) {
    this.text = text;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  getTemplate() {
    return `
    <div class="notification ${this.type}" style="--value:${this.duration/1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">
            ${this.text}
        </div>
        </div>
    </div>
    `
  }

  render() {
    const tempWrapper = document.createElement('div');
    tempWrapper.innerHTML = this.getTemplate();
    this.element = tempWrapper.firstElementChild; 
  }

  show(parent = document.body) {
    if (NotificationMessage.currentNotif) {
      NotificationMessage.currentNotif.remove();
    }
   
    parent.append(this.element);

    NotificationMessage.currentNotif = this;

    this.timerId = setTimeout(() => {
        this.remove();
    }, this.duration);
  }

  remove() {
    clearTimeout(this.timerId);

    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    NotificationMessage.currentNotif = null;
  }

}
