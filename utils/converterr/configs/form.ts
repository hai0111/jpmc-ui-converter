import { ERuleConfigType, type IRuleConfig, regexParser } from "./utils";

const rulesConfig: IRuleConfig[] = [
  {
    type: ERuleConfigType.EDIT,
    detected:
      "<form:select(?:(?<![^>]*select__input)[^>])*(?:/>|>%any%*?</form:select>)",
    dataReplaced: (str) => {
      str = str.addClasses(regexParser("<form:select[^>]*>"), "select__input");

      let result = `<div class="select select--small">
      <div class="select__container">
      ${str}
      </div>
    </div>`;

      result = result.replaceClasses(
        regexParser("<form:errors[^>]*>"),
        "form-error"
      );

      const path = str.match(/(?<=path=").+?(?=")/)?.[0] || "";

      result = result.addClasses(
        regexParser('<div class="select select--small">'),
        `\${errors.hasFieldErrors('${path}') ? 'select--error' : ''}`
      );

      return result;
    },
  },
  {
    type: ERuleConfigType.EDIT,
    detected:
      "<form:input(?:(?<![^>]*text-input__input)[^>])*(?:/>|>%any%*?</form:input>)",
    dataReplaced: (str, ...rest) => {
      str = str.addClasses(
        regexParser("<form:input[^>]*>"),
        "text-input__input"
      );

      console.log(rest);

      let result = `<div class="text-input text-input--small">
      <div class="text-input__container">
      ${str}
      </div>
    </div>`;

      result = result.replaceClasses(
        regexParser("<form:errors[^>]*>"),
        "form-error"
      );

      const path = str.match(/(?<=path=").+?(?=")/)?.[0] || "";

      result = result.addClasses(
        regexParser('<div class="text-input text-input--small">'),
        `\${errors.hasFieldErrors('${path}') ? 'text-input--error' : ''}`
      );

      return result;
    },
  },
  {
    type: ERuleConfigType.EDIT,
    detected: "<form:errors[^>]*/>",
    dataReplaced: "replace_class:form-error",
  },
];

export default rulesConfig;
