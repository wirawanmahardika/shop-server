export function categoryBlobsToImages(arrayOfItems) {
  const data = arrayOfItems.map((d) => {
    d.category_photo =
      `data:image/png;base64,` + d.category_photo.toString("base64");
    return d;
  });

  return data;
}

export function brandBlobsToImages(arrayOfItems) {
  const data = arrayOfItems.map((d) => {
    d.brand_photo = `data:image/png;base64,` + d.brand_photo.toString("base64");
    return d;
  });

  return data;
}

export function itemBlobsToImages(arrayOfItems) {
  const data = arrayOfItems.map((d) => {
    d.photo_item = `data:image/png;base64,` + d.photo_item.toString("base64");
    return d;
  });

  return data;
}

export function userBlobToImage(item) {
  if (item.photo) {
    item.photo = `data:image/png;base64,` + item.photo.toString("base64");
  }
  return item;
}
