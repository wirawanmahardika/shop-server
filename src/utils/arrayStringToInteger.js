export function arrayStringToInteger(array) {
  if (array.length < 1) return undefined;
  const convertedData = array.map((d) => parseInt(d));
  return convertedData;
}
