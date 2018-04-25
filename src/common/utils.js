/**
 * 通过后缀名返回文件类型
 * @export {function}
 * @param {String} extension 文件后缀名
 * @returns {string} 文件类型
 */
export function extension2Type(extension) {
  let result = null;
  const typeMap = {
    image: ["png", "jpg", "gif"],
    word: ["doc", "docx", "wps"],
    excel: ["xls", "xlsx"],
    ppt: ["ppt", "pptx"],
    txt: ["txt"],
    pdf: ["pdf"],
    zip: ["zip", "rar", "7z"]
  };
  Object.keys(typeMap).forEach(type => {
    if (typeMap[type].indexOf(extension.toLowerCase()) > -1) {
      result = type;
    }
  });
  return result;
}
/**
 * 通过文件名返回后缀名
 * @export {function}
 * @param {string} fileName 文件名字
 * @returns {string} 文件后缀名
 */
export function getExtension(fileName) {
  const extension = fileName.split(".")[fileName.split(".").length - 1];
  return extension;
}
