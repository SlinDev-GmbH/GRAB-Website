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
