import { ERuleConfigType, regexParser, type IRuleConfig } from "./utils";

const ruleConfigs: IRuleConfig[] = [
  {
    type: ERuleConfigType.EDIT,
    detected: `<table[^>]*>%any%+?</table>`,
    dataReplaced: (str) => {
      str = str.addClasses(regexParser("(<table[^>]*>)"), "form-table");

      str = str.replace(
        regexParser(
          "<tr>%space%*<td[^>]*tbl_header txt_center[^>]*>([^<]*)</td>%space%*</tr>"
        ),
        '<div class="form-table__title">$2</div>'
      );

      str = str.addClasses(regexParser("<tr[^>]*[^>]*>"), "form-table__row");

      str = str.addClasses(
        regexParser("<td[^>]*tbl_header[^>]*>"),
        "form-table__label"
      );
      str = str.addClasses(
        regexParser("<td((?![^>]*form-table__label)[^>])*>"),
        "form-table__control"
      );

      str = str.replace(regexParser("</(table|tr|td)>"), "</div>");
      str = str.replace(regexParser("<(table|tr|td)"), "<div");
      return str;
    },
  },
];

export default ruleConfigs;
