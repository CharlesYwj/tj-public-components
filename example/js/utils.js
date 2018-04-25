export function list2tree(list, idKey = "id", parentKey = "pId") {
  let temp = [];
  let result = [];
  let hash = {};
  if (!Array.isArray(list)) {
    return [];
  }
  list.forEach(ele => {
    temp.push(Object.assign({}, ele));
  });
  temp.forEach(ele => {
    hash[ele[idKey]] = ele;
  });
  temp.forEach(ele => {
    let _id = ele[idKey];
    let _parentKey = hash[_id][parentKey];
    if (_parentKey && typeof hash[_parentKey] !== "undefined") {
      hash[_parentKey].children = hash[_parentKey].children || [];
      hash[_parentKey].children.push(ele);

    } else {
      result.push(ele);
    }
  });
  return result;
}
