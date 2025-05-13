import { ERuleConfigType, type IRuleConfig, regexParser } from "./utils";

const ruleConfigs: IRuleConfig[] = [
  {
    type: ERuleConfigType.EDIT,
    detected: "(?<=(?:<table[^>]*>|</thead>))(?=%before%*<tr)",
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

      str = str.addClasses(
        regexParser("(?<=<thead[^>]*>((?<!%any%*</thead>)%any%)*)<tr[^>]*>"),
        "table__thead__row"
      );

      str = str.addClasses(
        regexParser("(?<!<thead[^>]*>((?<!%any%*</thead>)%any%)*)<tr[^>]*>"),
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
    detected:
      "<c:choose>%space%*<c:when[^>]*count % 2 == 0[^>]*>(%any%*?)</c:when>%any%*?</c:choose>",
    dataReplaced: "$1",
  },
  {
    type: ERuleConfigType.EDIT,
    detected:
      "<c:if[^>]*>%space%*<[^>]*>%space%*[▲▼]%space%*</[^>]*>%space%*</c:if>",
    dataReplaced: (str) => {
      str = str.replace(regexParser("(?<=</?)\\w+(?=[>\\s])"), "span");

      let condition: string =
        str.match(regexParser('(?<=test=")[^"]+(?=")'))?.[0] || "";

      condition = condition.replace(regexParser("[${}]"), "");

      str = str.addClasses(
        regexParser("<[^>]*>%space%*[▲▼]%space%*</[^>]*>"),
        `table__column__sorter__icon${
          condition
            ? ` \${${condition} ? 'table__column__sorter__icon--active' : ''}`
            : ""
        }`
      );

      str = str.replace(regexParser("<c:if[^>]*>|</c:if>"), "");

      return str;
    },
  },
  {
    type: ERuleConfigType.EDIT,
    detected:
      "<c:if[^>]*>%space%*<[^>]*>%space%*[▽△]%space%*</[^>]*>%space%*</c:if>",
    dataReplaced: "",
  },
  {
    type: ERuleConfigType.WRAP,
    detected: "((?:%before%*<span[^>]*>%space%*[▲▼]%space%*</span>%after%*)+)",
    dataReplaced: `<div class="table__column__sorter">
      $1
    </div>`,
  },
];

export default ruleConfigs;
