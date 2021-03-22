// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';



// current products on the page
let currentProducts = [];
let currentPagination = {};

// inititiqte selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectBrands = document.querySelector('#brand-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');
const selectSort = document.querySelector('#sort-select');
const NbProducts = document.querySelector('#nbProducts');
/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12) => {
  try {
    const response = await fetch(`https://clear-fashion-api.vercel.app?page=${page}&size=${size}`);
    const body = await response.json();

    if (body.success !== true) {
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
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}">${product.name}</a>
        <span>${product.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
};

//Feature 2
const renderBrands = currentProducts => {
  try {
    let brands = [''];
    let brands_html = "";
    brands_html += `<option value="All">All</option>`
    for(let i = 0; i<currentProducts.length; i++){      
      if(brands.indexOf(currentProducts[i].brand) == -1){        
        brands.push(currentProducts[i].brand);
        brands_html += `<option value="${currentProducts[i].brand}">${currentProducts[i].brand}</option>`
      }
    }
    selectBrands.innerHTML = brands_html;
  }
  catch (error) {
    console.error(error);
  }  
}

function filterBrands(currentProducts, filterBrand){
  if(filterBrand != 'All'){
    let filteredProducts = [];
    for(let i = 0; i < currentProducts.length; i++){
      if(currentProducts[i].brand == filterBrand){
        filteredProducts.push(currentProducts[i]);
      }
    }
    renderProducts(filteredProducts);
  }else {
    renderProducts(currentProducts);
  } 
}

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbProducts.innerHTML = count;
};

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderBrands(currentProducts);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 * @type {[type]}
 */
selectShow.addEventListener('change', event => {
  fetchProducts(currentPagination.currentPage, parseInt(event.target.value))
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

//Feature 1
selectPage.addEventListener('change', event => {
  fetchProducts(parseInt(event.target.value), selectShow.value)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

//Feature 2

selectBrands.addEventListener('change', event => {
    (SortChoice(currentProducts, selectSort.value));
});

document.addEventListener('DOMContentLoaded', () =>
  fetchProducts()
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination))
);
// Feature 
// Feature 3,4,5 and 6

function SortChoice(currentProducts,selecSort){
  if (selectSort.value == 'date-desc')
   SortDate(currentProducts,'desc');
  if (selectSort.value == 'date-asc')
    SortDate(currentProducts,'asc');
  if (selectSort.value == 'price-asc')
    SortPrice(currentProducts,'desc');
  if (selectSort.value == 'price-desc')
    SortPrice(currentProducts,'asc');
  if (selectSort.value == 'affordable')
    SortAffordable(currentProducts);
  if (selectSort.value == 'new-released')
    SortRecent(currentProducts);
}

function SortAffordable(currentProducts){
  let affordableproducts = [];
  for(let i = 0; i < currentProducts.length; i++){
    if(currentProducts[i].price < 50){
      affordableproducts.push(currentProducts[i]);
    }
  }
  filterBrands(affordableproducts, selectBrands.value);
}
function SortRecent(currentProducts){
  var date = new Date();
  let RecentProducts = [];
  for(let i = 0; i < currentProducts.length; i++){
    var DateProduct = new Date(currentProducts[i].released);
    if(date - DateProduct< 86400*15000){
      RecentProducts.push(currentProducts[i]);
    }
  }
  filterBrands(RecentProducts, selectBrands.value);
}
function compareDatedesc(a,b){
  if(a.released < b.released)
   return -1;
  if(a.released > b.released)
   return 1;
  return 0;
}
function compareDateasc(a,b){
  if(a.released < b.released)
   return 1;
  if(a.released > b.released)
   return -1;
  return 0;
}
function comparePricedesc(a,b){
  if(a.price < b.price)
   return -1;
  if(a.price > b.price)
   return 1;
  return 0;
}
function comparePriceasc(a,b){
  if(a.price < b.price)
   return 1;
  if(a.price > b.price)
   return -1;
  return 0;
}

function SortDate(currentProducts,type){
  if(type == 'desc'){
    let sortedProducts = currentProducts.sort(compareDatedesc);
    filterBrands(sortedProducts,selectBrands.value);
  }

  else{
    let sortedProducts = currentProducts.sort(compareDateasc);
    filterBrands(sortedProducts,selectBrands.value);
  }


}
function SortPrice(currentProducts,type){
  if(type == 'desc'){
    let sortedProducts = currentProducts.sort(comparePricedesc);
    filterBrands(sortedProducts,selectBrands.value);
  }
  else{
    let sortedProducts = currentProducts.sort(comparePriceasc);
    filterBrands(sortedProducts,selectBrands.value);
  }

}

selectSort.addEventListener('change', event => {
  SortChoice(currentProducts, event.target.value);
});