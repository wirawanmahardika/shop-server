import fs from "fs";

function convertiImageToBlob(pathImage) {
  const image = fs.readFileSync(pathImage);
  const blobImage = new Blob([image], { type: "image/jpeg" });
  return blobImage;
}

export const image1 = convertiImageToBlob("./test/image/hacker-1.jpg");
export const image2 = convertiImageToBlob("./test/image/hacker-2.jpg");
export const image3 = convertiImageToBlob("./test/image/hacker-2.jpg");
