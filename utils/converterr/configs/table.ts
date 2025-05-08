import { ERuleConfigType, type IRuleConfig, regexParser } from "./utils";

const ruleConfigs: IRuleConfig[] = [
  {
    type: ERuleConfigType.EDIT,
    detected: `<table[^>]*>%any%+?</table>`,
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
        regexParser("<th[^>]*>"),
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
    type: ERuleConfigType.WRAP,
    detected: "(?<=<table[^>]*>)(%any%+?)(?=</table>)",
    dataReplaced: `
    <tbody class="table__tbody">
      %content%
    </tbody>
  `,
  },
  {
    type: ERuleConfigType.WRAP,
    detected: "(<table[^>]*>%any%*?</table>)",
    dataReplaced: `
    <div class="table__container">
      %content%
    </div>
  `,
  },
  {
    type: ERuleConfigType.EDIT,
    detected:
      "<c:choose>%space%*<c:when[^>]*count % 2 == 0[^>]*>(%any%*?)</c:when>%any%*?</c:choose>",
    dataReplaced: "$1",
  },
];

export default ruleConfigs;
