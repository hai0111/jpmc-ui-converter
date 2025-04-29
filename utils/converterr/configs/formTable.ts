import { ERuleConfigType, regexParser, type IRuleConfig } from "./utils";

const ruleConfigs: IRuleConfig[] = [
  {
    type: ERuleConfigType.EDIT,
    isNested: true,
    detected: `<table[^>]*>((?<!%any%*<table)%any%)+?</table>`,
    dataReplaced: (str) => {
      str = str.addClasses(regexParser("(<table[^>]*>)"), "form-table");

      str = str.replace(
        regexParser(
          "<tr>%space%*<(?:td|th)[^>]*tbl_header txt_center[^>]*>([^<]*)</(?:td|th)>%space%*</tr>"
        ),
        '<div class="form-table__title">$2</div>'
      );

      str = str.addClasses(regexParser("<tr[^>]*[^>]*>"), "form-table__row");

      str = str.replaceClasses(
        regexParser(
          "(?<=<tr[^>]*form-table__row[^>]*>(%space%+)?)<(?:td|th)[^>]*>"
        ),
        "form-table__label"
      );

      str = str.replaceClasses(
        regexParser("<(?:td|th)((?![^>]*form-table__label)[^>])*>"),
        "form-table__control"
      );

      str = str.replace(regexParser("</(table|tr|td|th)>"), "</div>");
      str = str.replace(regexParser("<(table|tr|td|th)"), "<div");

      str = str.replace(regexParser('colspan="\\d+"'), "");
      return str;
    },
  },
];

export default ruleConfigs;
