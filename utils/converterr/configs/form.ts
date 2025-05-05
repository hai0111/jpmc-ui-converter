import { ERuleConfigType, type IRuleConfig, regexParser } from "./utils";

const rulesConfig: IRuleConfig[] = [
  {
    type: ERuleConfigType.EDIT,
    detected:
      "<form:select(?:(?<![^>]*select__input)[^>])*(?:/>|>%any%*?</form:select>)",
    dataReplaced: (str) => {
      const path = str.match(/(?<=path=").+?(?=")/)?.[0] || "";
      str = str.addClasses(regexParser("<form:select[^>]*>"), "select__input");

      let result = `<div class="select select--small \${errors.hasFieldErrors('${path}') ? 'select--error' : ''}">
      <div class="select__container">
      ${str}
      </div>
      <form:errors #custom path="${path}" cssClass="form-error"/>
    </div>`;

      return result;
    },
  },

  {
    type: ERuleConfigType.EDIT,
    detected:
      "<form:input(?:(?<![^>]*text-input__input)[^>])*(?:/>|>%any%*?</form:input>)",
    dataReplaced: (str) => {
      const path = str.match(/(?<=path=").+?(?=")/)?.[0] || "";

      str = str.addClasses(
        regexParser("<form:input[^>]*>"),
        "text-input__input"
      );

      let result = `<div class="text-input text-input--small \${errors.hasFieldErrors('${path}') ? 'text-input--error' : ''}">
      <div class="text-input__container">
      ${str}
      </div>
      <form:errors #custom path="${path}" cssClass="form-error"/>
    </div>`;

      return result;
    },
  },

  {
    type: ERuleConfigType.EDIT,
    detected:
      "<form:textarea(?:(?<![^>]*textarea__textarea)[^>])*(?:/>|>%any%*?</form:textarea>)",
    dataReplaced: (str) => {
      const path = str.match(/(?<=path=").+?(?=")/)?.[0] || "";

      str = str.addClasses(
        regexParser("<form:textarea[^>]*>"),
        "textarea__textarea"
      );

      let result = `<div class="textarea \${errors.hasFieldErrors('${path}') ? 'textarea--error' : ''}">
      <div class="textarea__container">
      ${str}
      </div>
      <form:errors #custom path="${path}" cssClass="form-error"/>
    </div>`;

      return result;
    },
  },

  {
    type: ERuleConfigType.EDIT,
    detected:
      "(%before%*<label>[^<]*?<form:checkbox[^>]*>[^<]*?</label>%after%*)+",
    dataReplaced: (str) => {
      str = str.addClasses(regexParser("<label[^>]*>"), "checkbox");

      str = str.addClasses(
        regexParser("<form:checkbox[^>]*>"),
        "checkbox__input"
      );

      str = str.replace(
        regexParser("(?<=<form:checkbox[^>]*>)([^<]*)"),
        '<span class="checkbox__label">$1</span>'
      );

      str = `
<fieldset class="checkbox__group">
  <div class="checkbox__group__inner">
    ${str}
  </div>
</fieldset>
      `;

      return str;
    },
  },
  {
    type: ERuleConfigType.EDIT,
    detected:
      "(%before%*<label>[^<]*?<form:radiobutton[^>]*>[^<]*?</label>%after%*)+",
    dataReplaced: (str) => {
      str = str.addClasses(regexParser("<label[^>]*>"), "radio");

      str = str.addClasses(
        regexParser("<form:radiobutton[^>]*>"),
        "radio__input"
      );

      str = str.replace(
        regexParser("(?<=<form:radiobutton[^>]*>)([^<]*)"),
        '<span class="radio__label">$1</span>'
      );

      str = `
<fieldset class="radio__group">
  <div class="radio__group__inner">
    ${str}
  </div>
</fieldset>
      `;

      return str;
    },
  },
  {
    type: ERuleConfigType.EDIT,
    detected: "<form:errors[^>]*/>",
    dataReplaced: "replaceClass:form-error",
  },
];

export default rulesConfig;
