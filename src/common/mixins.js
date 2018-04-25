import {
  extension2Type,
  getExtension
} from "./utils";

export const iconFilterMixin = {
  filters: {
    fileIcon(extension) {
      const baseClass = "fa ";
      const iconMap = {
        image: "fa-file-picture-o",
        word: "fa-file-word-o",
        excel: "fa-file-excel-o",
        ppt: "fa-file-powerpoint-o",
        txt: "fa-file-text-o",
        pdf: "fa-file-pdf-o",
        zip: "fa-file-zip-o"
      };
      const fileType = extension2Type(extension);
      if (fileType && iconMap[fileType]) {
        return baseClass + iconMap[fileType];
      } else {
        return `${baseClass}fa-file-o`;
      }
    },
    fileExtension(fileName) {
      return getExtension(fileName);
    }
  }
};

export const apiDataMixin = {
  data() {
    return {
      API: {
        query: "/doc/index",
        download: "/doc/download/",
        upload: "/doc/uploadFile",
        delete: "/doc/deleteByIds"
      }
    };
  }
};

export const typeFilterMixin = {
  methods: {
    typeFilter(extension) {
      return extension2Type(extension);
    }
  }
};
