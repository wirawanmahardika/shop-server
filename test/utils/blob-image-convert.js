export function convertBlobToImage(bufferFile) {
  const base64String = Buffer.from(bufferFile).toString("base64");
  return `data:image/jpeg;base64,${base64String}`;
}
