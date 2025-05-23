import { ERuleConfigType, type IRuleConfig, regexParser } from "./utils";

const ruleConfigs: IRuleConfig[] = [
  {
    type: ERuleConfigType.EDIT,
    detected: "tbl_header[\\w_-\\d]*",
    dataReplaced: "",
  },
  {
    type: ERuleConfigType.EDIT,
    detected: "tag:<table[^>]*>",
    dataReplaced: (str) => {
      return str;
    },
  },
  {
    type: ERuleConfigType.EDIT,
    detected: "(?<=(?:<table[^>]*>|</thead>))(?=%after%*%before%*<tr)",
    dataReplaced: `
    <tbody>
  `,
  },
  {
    type: ERuleConfigType.EDIT,
    detected: "(?=</table>)",
    dataReplaced: `
    </tbody>
  `,
  },
  {
    type: ERuleConfigType.EDIT,
    detected: `<table[^>]*>%any%+</table>`,
    dataReplaced: (str) => {
      str = str.addClasses(regexParser("<table[^>]*>"), "table");

      str = str.addClasses(regexParser("<thead[^>]*>"), "table__thead");

      str = str.addClasses(regexParser("<tbody[^>]*>"), "table__tbody");

      str = str.addClasses(regexParser("<tfoot[^>]*>"), "table__tfoot");

      str = str.addClasses(
        regexParser("(?<=<thead[^>]*>((?<!%any%*</thead>)%any%)*)<tr[^>]*>"),
        "table__thead__row"
      );

      str = str.addClasses(
        regexParser("(?<=<tfoot[^>]*>((?<!%any%*</tfoot>)%any%)*)<tr[^>]*>"),
        "table__tfoot__row"
      );

      str = str.addClasses(
        regexParser(
          "(?<!<(?:thead|tfoot)[^>]*>((?<!%any%*</(?:thead|tfoot)>)%any%)*)<tr[^>]*>"
        ),
        "table__tbody__row"
      );

      str = str.addClasses(
        regexParser("<th(?!e)[^>]*>"),
        "table__column table__column--border-right table__column--center"
      );

      str = str.addClasses(
        regexParser("<td[^>]*>"),
        "table__column table__column--border-right table__column--center"
      );

      str = str.replace(
        regexParser(
          "table__column--center(?=((?<!%any%*</td>)%any%)*formatNumber)"
        ),
        "table__column--right"
      );

      return str;
    },
  },
  {
    type: ERuleConfigType.EDIT,
    detected: "(?=<table[^>]*>)",
    dataReplaced: `
    <div class="table__container">
  `,
  },
  {
    type: ERuleConfigType.EDIT,
    detected: "(?<=</table[^>]*>)",
    dataReplaced: `
    </div>
  `,
  },
  {
    type: ERuleConfigType.EDIT,
    detected: "<t[hd][^>]*money[^>]*>",
    dataReplaced: (str) => {
      str.replace("table__column--center", "table__column--right");
      return str;
    },
  },
  {
    type: ERuleConfigType.EDIT,
    detected:
      "<c:choose>%space%*<c:when[^>]*count % 2 == 0[^>]*>(%any%*?)</c:when>%any%*?</c:choose>",
    dataReplaced: "$1",
  },
  {
    type: ERuleConfigType.EDIT,
    detected:
      "table__column--border-right(?=((?<!%any%*</t[dh]>)%any%)+</t[dh]>%after%*</tr>)",
    dataReplaced: "",
    test: true,
  },
];

export default ruleConfigs;
