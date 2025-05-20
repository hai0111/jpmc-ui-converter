import {
  ERuleConfigType,
  regexParser,
  selectAllElement,
  type IRuleConfig,
} from "./utils";

const ruleConfigs: IRuleConfig[] = [
  {
    type: ERuleConfigType.EDIT,
    isNested: true,
    detected: `<table[^>]*>((?<!%any%*<table)%any%)+?</table>`,
    dataReplaced: (str) => {
      str = str.addClasses(regexParser("(<table[^>]*>)"), "form-table");

      str = str.replace(regexParser("</?(thead|tbody|tfoot)[^>]*>"), "");

      str = str.addClasses(regexParser("<tr[^>]*[^>]*>"), "form-table__row");

      const trs = selectAllElement(str, "<tr[^>]*>");

      trs.forEach((tr) => {
        let odd = true;
        let trReplacer = tr;
        const cells = selectAllElement(tr, "<(?:td|th)[^>]*>");
        cells.forEach((cell) => {
          const cellReplacer = cell.addClasses(
            regexParser("<(?:td|th)[^>]*>"),
            odd ? "form-table__label" : "form-table__control"
          );
          trReplacer = trReplacer.replace(cell, cellReplacer);
          odd = !odd;
          if (cell.includes("rowspan")) odd = true;
        });
        str = str.replace(tr, trReplacer);
      });

      str = str.replace(
        regexParser(
          "(?<=<(?:td|th)[^>]*form-table__control[^>]*>)(%any%*?)(?=</(?:td|th)>)"
        ),
        (m, p1) => {
          p1 = p1.replace(
            regexParser("(?<=<(?:td|th)[^>]*form-table__control[^>]*>)"),
            '<div class="form-table__input">'
          );

          return `
          <div class="form-table__input">
          ${p1}
  </div>`;
        }
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
