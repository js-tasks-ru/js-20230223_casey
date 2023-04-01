import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements = {};

  constructor (productId) {
    this.productId = productId;
    this.url = new URL('/api/rest/products', BACKEND_URL); 
    if (productId) {
      this.url.searchParams.set('id', this.productId);
    }

    this.render();
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

  async render () {
    const tempWrapper = document.createElement('div');
    tempWrapper.innerHTML = this.getTemplate();
    const element = tempWrapper.firstElementChild; 
    this.element = element;

    this.subElements = this.getSubElements(element);
    this.form = this.subElements.productForm;

    let data = null; 
    let categories;

    if (this.productId) {
      [data, categories] = await Promise.all([
        this.loadItemData(), 
        this.loadCategories(),
      ]);
    } else {
      categories = await this.loadCategories();
    }
    
    for (let { id, title } of categories) {
      const newOption = new Option(title, id);
      this.form.subcategory.append(newOption);
    }

    this.form.title.value = data?.title || '';
    this.form.description.value = data?.description || '';
    this.form.price.value = data?.price || 100;
    this.form.discount.value = data?.discount || 0;
    this.form.quantity.value = data?.quantity || 1;
    this.form.status.value = 1;

    if (this.productId) {
      this.form.subcategory.value = data.subcategory;
    } else {
      this.form.subcategory.selectedIndex = 0;
    }
    
    this.form.uploadImage.onclick = () => this.uploadImage();
    this.initEventListeners();
  }

  uploadImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      let img = input.files[0];
      let link;
      let data = new FormData();
      data.append("image", img);
      this.subElements.productForm.uploadImage.classList.add("is-loading");
      this.subElements.productForm.uploadImage.disabled = true;
      try {
        const url = new URL('/3/upload', 'https://api.imgur.com');
        const params = {
          method: 'post',
          headers: {
            'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: data,
        };
        const item = await fetchJson(url, params);
        link = item.data.link;

      } catch (e) {
        // console.log(e);
      } finally {
        this.subElements.productForm.uploadImage.classList.remove("is-loading");
        this.subElements.productForm.uploadImage.disabled = false;
        this.addImageListItem({
          url: link,
          source: img.name
        });
      }
    };
    input.hidden = true;
    document.body.appendChild(input);
    input.click();
  }

  addImageListItem = ({ url, source }) => {
    const item = `<li class="products-edit__imagelist-item sortable-list__item" style="">
      <input type="hidden" name="url" value=${escapeHtml(url)}>
      <input type="hidden" name="source" value=${escapeHtml(source)}>
      <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src=${escapeHtml(url)}>
        <span>${escapeHtml(source)}</span>
      </span>
      <button type="button">
        <img src="icon-trash.svg" data-delete-handle="" alt="delete">
      </button>
    </li>`;
    this.subElements.imageListContainer.firstElementChild.insertAdjacentHTML('beforeend', item);
  }


  async loadItemData() {
    const data = await fetchJson(this.url);
    this.data = data[0];
    return data[0];
  }

  async loadCategories() {
    const url2 = new URL('/api/rest/categories', BACKEND_URL); 
    url2.searchParams.set('_sort', 'weight');
    url2.searchParams.set('_refs', 'subcategory');
    const categoriesArray = await fetchJson(url2);
    const categories = categoriesArray.flatMap(obj => obj.subcategories);
    return categories;
  }

  getTemplate() {
    return `<div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
          <ul class="sortable-list">
           
          </ul>
        </div>
        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory">
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" placeholder="1">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    </form>
  </div>`;
  }

  initEventListeners() {
    this.subElements.productForm.addEventListener("submit", e => this.onSubmit(e));
  }

  getFormData() {
    const { title, description, subcategory, price, quantity, discount, status } = this.form;
    const formData = {
      title: title.value,
      description: description.value,
      subcategory: subcategory.value,
      price: Number(price.value),
      quantity: Number(quantity.value),
      discount: Number(discount.value),
      status: Number(status.value),
      images: [],
    };
    if (this.productId) {
      formData.id = this.productId;
    }
    return formData;
  }

  prepareImagesData() {
    const imgArr = Array.from(new FormData(this.subElements.productForm)).filter(item => item[0] === "url" || item[0] === "source");
    const arr = [];

    for (let i = 0; i < imgArr.length; i++) {
      arr.push({
        url: imgArr[i][1],
        source: imgArr[i + 1][1]
      });
      i++;
    }

    return arr;
  }

  async onSubmit(e) {
    e.preventDefault();
    const formData = this.getFormData();
    formData.images = this.prepareImagesData();
    const url = new URL('/api/rest/products', BACKEND_URL); 

    await fetchJson(url, {
      method: formData.id ? "PATCH" : "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const customEvent = this.productId 
      ? new CustomEvent("product-saved") 
      : new CustomEvent("product-updated");

    this.element.dispatchEvent(customEvent);
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
