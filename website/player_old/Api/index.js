export const getItems = async () => {
  const item_api = await fetch(
    "https://api.slin.dev/grab/v1/get_shop_items?version=1"
  );
  const items = await item_api.json();
  return items;
};

export const getCatalogueResponse = async () => {
  const catalogResponse = await fetch(
    "https://api.slin.dev/grab/v1/get_shop_catalog?version=1"
  );
  const catalog = await catalogResponse.json();
  return catalog;
};

export const getShopProducts = async () => {
  const shopsResponse = await fetch(
    "https://api.slin.dev/grab/v1/get_shop_products?version=1"
  );
  const products = await shopsResponse.json();
  return products;
};

export const setCustomizations = async (userStore) => {
const requestBody= userStore.userInfo.active_customizations
  console.log(JSON.stringify(requestBody))
    fetch(`https://api.slin.dev/grab/v1/set_active_customizations?access_token=${userStore.accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }).then(function (response) {
      return response;
    })
      .then(function (data) {
        console.log(data);
      })
      .catch(function (error) {
        console.error('Error:', error);
      });
}
