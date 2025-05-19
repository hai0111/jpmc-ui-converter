import { ERuleConfigType, regexParser, type IRuleConfig } from "./utils";

const ruleConfigs: IRuleConfig[] = [
  {
    type: ERuleConfigType.EDIT,
    isNested: true,
    detected: `<table[^>]*>((?<!%any%*<table)%any%)+?</table>`,
    dataReplaced: (str) => {
      str = str.addClasses(regexParser("(<table[^>]*>)"), "form-table");

      str = str.replace(regexParser("</?(thead|tbody|tfoot)[^>]*>"), "");

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
