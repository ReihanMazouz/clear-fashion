// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// current products on the page
let currentProducts = [];
let currentPagination = {};

// inititiqte selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');
const selectBrand = document.querySelector('#brand-select');
const goodprice = document.querySelector('#goodprice');
const filter_price = document.querySelector('#filter-price');
const selectSort= document.querySelector('#sort-select');
const pricegraph = document.querySelector("#pricedistrib");
const fav_list = document.querySelector('#render-fav');
const prod_list = document.querySelector('#render-products');
const hide_indic = document.querySelector('#hide-indicators');
const indic = document.querySelector('#indic')
/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({products, meta}) => {
  currentProducts = products;
  currentPagination = meta;
};
/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
let myproducts = [];
let mypagination = {};

const setmyProducts = ({result, meta}) => {
  myproducts = result;
  mypagination = meta;
};

const fetchProducts = async (page = 1, size = 12, brand = null, price = null, sort = 1) => {
  try {
    let URL = `https://server-mauve-two.vercel.app/products/search?sort=${sort}&limit=${size}&page=${page}&`;
    if(brand) {
      URL += `brand=${brand}&`;
    }
    if(price) {
      URL += `price=${price}&`;
    }
    const response = await fetch(URL);
    const body = await response.json();

    if (body.page !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }
    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  const template = products
    .map(product => {
      if (localStorage.getItem(product._id)) {
        return `
        <div class="product-card" id=${product._id}>
          <div class="product-image">
            <a href="${product.link} target="_blank">
              <img src="${product.image}">
            </a>
          </div>
          <div class="product-info">
            <span><b>${product.brand}</b></span>
            <a class="prodname" href="${product.link}" target="_blank">${product.name}</a>
            <p>${product.price}€</p>
          </div>
            <svg class="ico liked" width="24" height="24" viewBox="0 0 24 24">
              <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"></path>
            </svg>
        </div>
    `;
  } else {
    return `
        <div class="product-card" id=${product._id}>
          <div class="product-image">
            <a href="${product.link}" target="_blank">
              <img src="${product.image}">
            </a>
          </div>
          <div class="product-info">
            <span><b>${product.brand}</b></span>
            <a class="prodname" href="${product.link}" target="_blank">${product.name}</a>
            <p>${product.price}€</p>
          </div>
            <svg class="ico" width="24" height="24" viewBox="0 0 24 24">
              <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"></path>
            </svg>
        </div>
    `;
  }
    })
    .join('');

  sectionProducts.innerHTML = template;
};


const addfav = (id) => {
  if (localStorage.getItem(id)) {
    localStorage.removeItem(id);
  } else {
    localStorage.setItem(id, JSON.stringify(currentProducts.find(element => element._id === id)));
  }
}
/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const num_page = pagination.num_page
  const options = Array.from(
    {'length': Math.ceil(num_page)},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = pagination.currentPage - 1;
};



const render_filter = pagination => {
  const extremas = pagination.extremas[0];
  const min = parseInt(extremas.min)+1;
  const max = parseInt(extremas.max)+1;
  filter_price.setAttribute("min", min);
  filter_price.setAttribute("max", max);
}


/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {total_count, price_list} = pagination;
  spanNbProducts.innerHTML = total_count;

  const prices_list = Array.from(price_list,
    (value, index) => value.price);
};

/**
* Render brand selector
*/
const renderbrands= pagination =>{

  let brands = [""]
  brands.push(...pagination.brand_list)
  const options2 = Array.from(
    {'length': brands.length},
    (value, index) => `<option value="${brands[index]}">${brands[index]}</option>`
  ).join('');
/*indique le contenu et à qu'elle valeur on veut commencer*/
  selectBrand.innerHTML=options2;
  const brand_index = brands.indexOf(pagination.currentbrand)
  selectBrand.selectedIndex = brand_index;
};


const render = (products, pagination) => {
  renderbrands(pagination);
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);
  render_filter(pagination);
};

const render_like_button = function() {
  var likes_Btn = document.querySelectorAll('.ico');
  likes_Btn.forEach((button) => {
    var id = button.parentElement.id
    button.addEventListener('click', function() {
      addfav(id);
      button.classList.toggle('liked') })
  })
}

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 * @type {[type]}
 */

goodprice.addEventListener('change', (event) => {
  if (goodprice.checked) {
    if (selectSort.value ==="default") {
    fetchProducts(currentPagination.currentPage, currentPagination.pageSize, currentPagination.currentbrand, filter_price.value)
      .then(setCurrentProducts)
      .then(()=> render(currentProducts, currentPagination))
      .then(()=> render_like_button())
  } else {
    fetchProducts(currentPagination.currentPage, currentPagination.pageSize, currentPagination.currentbrand, filter_price.value, -1)
      .then(setCurrentProducts)
      .then(()=> render(currentProducts, currentPagination))
      .then(()=> render_like_button())
  } }
  else { if (selectSort.value ==="default") {
    fetchProducts(currentPagination.currentPage, currentPagination.pageSize, currentPagination.currentbrand, null)
      .then(setCurrentProducts)
      .then(()=> render(currentProducts, currentPagination))
  } else {
     fetchProducts(currentPagination.currentPage, currentPagination.pageSize, currentPagination.currentbrand, null, -1)
      .then(setCurrentProducts)
      .then(()=> render(currentProducts, currentPagination))
      .then(()=> render_like_button())
  }}
});

filter_price.addEventListener('change', event => {
  if (goodprice.checked) {
    if (selectSort.value==="default") {
    fetchProducts(currentPagination.currentPage, currentPagination.pageSize, currentPagination.currentbrand, event.target.value)
      .then(setCurrentProducts)
      .then(()=> render(currentProducts, currentPagination))
      .then(()=> render_like_button())
  } else {
    fetchProducts(currentPagination.currentPage, currentPagination.pageSize, currentPagination.currentbrand, event.target.value, -1)
      .then(setCurrentProducts)
      .then(()=> render(currentProducts, currentPagination))
      .then(()=> render_like_button())
  } }
});


selectBrand.addEventListener('change', event => {
  if (selectSort.value === "default") {
  fetchProducts(1, currentPagination.pageSize, event.target.value, currentPagination.currentprice)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination))
    .then(()=> render_like_button());
  } else {
    fetchProducts(1, currentPagination.pageSize, event.target.value, currentPagination.currentprice,-1)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination))
    .then(()=> render_like_button());
  }
});


selectShow.addEventListener('change', event => {
  fetchProducts(currentPagination.currentPage, parseInt(event.target.value), currentPagination.currentbrand, currentPagination.currentprice, currentPagination.currentSort)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination))
    .then(()=> render_like_button());
});


selectPage.addEventListener('change', event => {
  fetchProducts(parseInt(event.target.value), currentPagination.pageSize, currentPagination.currentbrand, currentPagination.currentprice, currentPagination.currentSort)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination))
    .then(()=> render_like_button());
});



selectSort.addEventListener('change', event => {
  let sort=1;
  if(event.target.value==="price-desc"){sort = -1}
  fetchProducts(currentPagination.currentPage, currentPagination.pageSize, currentPagination.currentbrand, currentPagination.currentprice, sort)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination))
    .then(()=> render_like_button());
})

fav_list.addEventListener('click', event => {
  let fav_products = []
  for(let i=0; i<localStorage.length; i++) {
    fav_products.push(JSON.parse(localStorage.getItem(localStorage.key(i))));
  }
  render(fav_products, currentPagination);
  render_like_button();
})

prod_list.addEventListener('click', event => {
  render(currentProducts, currentPagination);
  render_like_button();
})

hide_indic.addEventListener('click', event => {
  if (indic.style.display=='block') {
    hide_indic.firstElementChild.firstElementChild.className = "arrow down"
    indic.style.display = 'none'
  } else {
    indic.style.display = 'block'
    hide_indic.firstElementChild.firstElementChild.className = "arrow up"
  }
}, false)

document.addEventListener('DOMContentLoaded', () =>
  fetchProducts()
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination))
    .then(()=> render_like_button()));