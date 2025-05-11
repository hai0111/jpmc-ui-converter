import {
  ERuleConfigType,
  regexParser,
  selectAllElement,
  selectElement,
  type IRuleConfig,
} from "./utils";

const ruleConfigs: IRuleConfig[] = [
  {
    type: ERuleConfigType.EDIT,
    detected: `tag:<table[^>]*>`,
    dataReplaced: (str) => {
      str = str.addClasses(regexParser("(<table[^>]*>)"), "form-table");

      str = str.replace(regexParser("</?(thead|tbody|tfoot)[^>]*>"), "");

      const TRsHasRowSpan = selectAllElement(
        str,
        "<tr((?<!%any%*</tr>)%any%)+?rowspan"
      );

      TRsHasRowSpan.forEach((tr) => {
        let regex = tr.toNormalChar();
        let result = "";
        let count = Number(tr.match(/(?<=rowspan=")\d+(?=")/) || 0);

        while (count > 0) {
          const nextTR = selectElement(str, `(?<=${regex})%before%*<tr[^>]*>`);
          result += nextTR;
          regex = nextTR.toNormalChar();
          count--;
        }

        const dataReplace = tr
          .replace(
            /(?=<\/tr>$)/,
            `<div class="col-19">
          ${result}
          </div>`
          )
          .replace(
            regexParser(
              '(?<=rowspan="\\d+"[^>]*>%any%+?</td>)((%before%*<td[^>]*>%any%+?</td>%after%*)+)'
            ),
            "<tr>$1</tr>"
          );

        console.log(dataReplace);

        str = str.replace(result, "");
        str = str.replace(tr, dataReplace);
      });

      str = str.addClasses(regexParser("<tr[^>]*[^>]*>"), "form-table__row");

      str = str.addClasses(
        regexParser(
          "(?<=<tr[^>]*form-table__row[^>]*>(%space%+)?)<(?:td|th)[^>]*>"
        ),
        "form-table__label"
      );

      str = str.addClasses(
        regexParser("<(?:td|th)((?![^>]*form-table__label)[^>])*>"),
        "form-table__control"
      );

      str = str.replace(
        regexParser(
          "(?<=<(?:td|th)[^>]*form-table__control[^>]*>)(%any%*?)(?=</(?:td|th)>)"
        ),
        `<div class="form-table__input">
          $1
  </div>
  `
      );

      str = str.replace(regexParser("</(table|tr|td|th)>"), "</div>");
      str = str.replace(regexParser("<(table|tr|td|th)"), "<div");

      str = str.replace(regexParser('colspan="\\d+"'), "");
      return str;
    },
  },
  {
    type: ERuleConfigType.EDIT,
    detected:
      "<div[^>]*form-table__label[^>]*>(?=((?<!%any%*<div[^>]*form-table__row[^>]*>)%any%)+input_required)",
    dataReplaced: "addClass:form-label--required",
  },
  {
    type: ERuleConfigType.EDIT,
    detected:
      "<c:choose>%space%*<c:when[^>]*count % 2 == 0[^>]*>(%any%*?)</c:when>%any%*?</c:choose>",
    dataReplaced: "$1",
  },
];

export default ruleConfigs;
