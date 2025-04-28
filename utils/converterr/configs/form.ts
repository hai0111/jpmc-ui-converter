import { ERuleConfigType, type IRuleConfig, regexParser } from "./utils";

const rulesConfig: IRuleConfig[] = [
  {
    type: ERuleConfigType.EDIT,
    detected:
      "(<form:select[^>]*>%any%*?</form:select>)(%space%+<form:errors[^>]*>)?",
    dataReplaced: (str, p1, p2) => {
      p1 = p1.addClasses(regexParser("<form:select[^>]*>"), "select__input");

      let result = `<div class="select select--small">
      <div class="select__container">
      ${p1}
      </div>${p2 ? p2 + "\n" : ""}
    </div>`;

      if (p2) {
        result = result.replaceClasses(
          regexParser("<form:errors[^>]*>"),
          "form-error"
        );

        const path = p2.match(/(?<=path=")\w+(?=")/)?.[0] || "";

        result = result.addClasses(
          regexParser('<div class="select select--small">'),
          `\${errors.hasError('${path}') ? 'select--error' : ''}`
        );
      }

      return result;
    },
  },
];

export default rulesConfig;
