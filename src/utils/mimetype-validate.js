export function mimetypeValidate(file) {
    if (
      !(
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/png"
      )
    ) {
      return true;
    } else {
      return false;
    }
}