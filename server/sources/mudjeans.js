const axios = require('axios');
const cheerio = require('cheerio');
const {'v5': uuidv5} = require('uuid');
/**
 * Parse webpage e-shop
 * @param  {String} data - html response
 * @return {Array} products
 */
 const parse = data => {
  const $ = cheerio.load(data);

  return $('.product-link')
    .map((i, element) => {
      const link = `https://mudjeans.eu${$(element)
        .find('.product-title a')
        .attr('href')}`;
      const brand = "Mudjeans"
      const name = $(element)
        .find('.product-title')
        .text()
        .trim()
        .replace(/\s/g, ' ');
      const price = parseInt(
        $(element)
          .find('.product-price')
          .first()
          .text()
          .replace(/\s|(Buy)|€/g, '')
          .replace(/,/g, '.'));
      const photo = $(element)
        .find('.primary-image img')
        .attr('src');
      const id = uuidv5(link, uuidv5.URL);

      return {id, brand, name, price, photo, link};
    })
    .get();
};

/**
 * Scrape all the products for a given url page
 * @param  {[type]}  url
 * @return {Array|null}
 */
module.exports.scrape_products = async url => {
  const response = await axios(url);
  const {data, status} = response;

  if (status >= 200 && status < 300) {
    return parse(data);
  }

  console.error(status);

  return null;
};

//Scrape all links on the welcome page of the website
module.exports.scrape_links = async url => {
  const response = await axios(url);
  const {data, status} = response;

  if (status >= 200 && status < 300) {
    return parse_links(data);
  }

  console.error(status);

  return null;
};

const parse_links = data => {
  const $ = cheerio.load(data);

  return $('.header-navigation--primary .header-nav-list-item')
    .map((i, element) => {
      const link = $(element)
        .find('.header-nav-list-item > a[href]')
        .attr('href')

      return link;
    })
    .get();
};
