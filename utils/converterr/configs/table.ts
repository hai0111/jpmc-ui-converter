import { ERuleConfigType, type IRuleConfig, regexParser } from "./utils";

const ruleConfigs: IRuleConfig[] = [
  {
    type: ERuleConfigType.EDIT,
    detected: `<table[^>]*>%any%+?</table>`,
    dataReplaced: (str) => {
      str = str.replaceClasses(regexParser("<table[^>]*>"), "table");

      str = str.replaceClasses(regexParser("<thead[^>]*>"), "table__thead");

      str = str.replaceClasses(regexParser("<tbody[^>]*>"), "table__tbody");

      str = str.replaceClasses(
        regexParser("(?<=<thead[^>]*>%any%*)<tr[^>]*>(?=%any%*</thead>)"),
        "table__thead__row"
      );

      str = str.replaceClasses(
        regexParser("(?<!<thead[^>]*>%any%*)<tr[^>]*>(?!%any%*</thead>)"),
        "table__tbody__row"
      );

      str = str.replaceClasses(
        regexParser("<th [^>]*>"),
        "table__column table__column--border-right table__column--center"
      );

      str = str.replaceClasses(
        regexParser("<td[^>]*>"),
        "table__column table__column--border-right table__column--center"
      );
      str = str.replaceClasses(
        regexParser(
          "<t[dh][^>]*>(?=((?<!%any%*?</t[dh]>)%any%)*</t[dh]>%after%*</tr>)"
        ),
        "table__column table__column--center"
      );

      return str;
    },
  },
  {
    type: ERuleConfigType.WRAP,
    detected: "(?<=<table[^>]*>)(%any%*?)(?=</table>)",
    dataReplaced: `
    <tbody class="table__tbody">
      %content%
    </tbody>
  `,
  },
  {
    type: ERuleConfigType.WRAP,
    detected: "(<table[^>]*#table[^>]*>%any%*?</table>)",
    dataReplaced: `
    <div class="table__container">  
      %content%
    </div>
  `,
  },
];

export default ruleConfigs;
