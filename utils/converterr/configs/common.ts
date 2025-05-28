import { ERuleConfigType, type IRuleConfig, regexParser } from "./utils";

const rulesConfig: IRuleConfig[] = [
  {
    type: ERuleConfigType.DELETE,
    detected: `<(dl|dt|dd)>`,
  },
  {
    type: ERuleConfigType.DELETE,
    detected: `<div[^>]*content_main[^>]*">`,
  },
  {
    type: ERuleConfigType.DELETE,
    detected: `<div[^>]*property_info_left[^>]*">`,
  },
  {
    type: ERuleConfigType.DELETE,
    detected: `<div[^>]*table__container[^>]*>`,
  },
  {
    type: ERuleConfigType.DELETE,
    detected: `<tbody[^>]*>`,
  },
  {
    type: ERuleConfigType.DELETE,
    detected: "<div[^>]*pager[^>]*>",
  },
  {
    type: ERuleConfigType.DELETE,
    detected: `<div class="clear">`,
  },
  {
    type: ERuleConfigType.EDIT,
    detected: `<div[^>]*clear[^>]*"/>`,
  },
  {
    type: ERuleConfigType.EDIT,
    detected: `<p[^>]*>`,
    dataReplaced: "addClass:my--0",
  },
  {
    type: ERuleConfigType.EDIT,
    detected: `<br[^>]*clear[^>]*>`,
    dataReplaced: "",
  },
  {
    type: ERuleConfigType.EDIT,
    detected: `cssErrorClass="[^"]*"`,
    dataReplaced: "",
  },
  {
    type: ERuleConfigType.EDIT,
    detected: `msg_error`,
    dataReplaced: "form-error",
  },
  {
    type: ERuleConfigType.EDIT,
    detected: [
      "txt_\\w+",
      "ime_\\w+",
      'xmlns:m="http://mayaa.seasar.org"',
      "tr_not_fixed_row",
      "comm_sub_tbl[\\w_-\\d]*",
      "btn_right",
      "even_row",
      "input_disabled",
      "submit_area",
      "td_bottom",
      "td_top",
      "dot_top",
      "dot_bottom",
      "comm_tbl[\\w_-\\d]*",
      "no_border[\\w_-\\d]*",
      '(?<=["\\s])table__[\\w_-\\d]+',
      '(?<=class="[^"]*)(?<=["\\s])table(?=[^"]*")',
    ].join("|"),
    dataReplaced: "",
  },
  {
    type: ERuleConfigType.EDIT,
    detected: `<c:import[^>]*head_google_font.jsp[^>]*>`,
    dataReplaced: "",
  },
  {
    type: ERuleConfigType.EDIT,
    detected: `<link((?<![^>]*(?:calendar.css|ajaxComboBox.css))[^>])*>`,
    dataReplaced: "",
  },
  {
    type: ERuleConfigType.EDIT,
    detected: `msg_box_error_left(?=")`,
    dataReplaced: "msg_box_error_left alert alert--error",
  },
  {
    type: ERuleConfigType.EDIT,
    detected: `msg_box_notice_left(?=")`,
    dataReplaced: "msg_box_error_left alert",
  },
  {
    type: ERuleConfigType.EDIT,
    detected: `(?<=msg_box_error[^>]*>%space%*)<ul[^>]*>`,
    dataReplaced: "addClass:no-list",
  },
  {
    type: ERuleConfigType.EDIT,
    detected: `msg_bold`,
    dataReplaced: "text--bold",
  },
  {
    type: ERuleConfigType.EDIT,
    detected: `&nbsp;`,
    dataReplaced: " ",
  },
  {
    type: ERuleConfigType.EDIT,
    detected: 'style="\\$\\{[^\\}]*?\\}"',
    dataReplaced: "",
  },
  {
    type: ERuleConfigType.EDIT,
    detected: `style="[^"]*?"`,
    dataReplaced: "",
  },
  {
    type: ERuleConfigType.EDIT,
    detected: "btn_\\d+",
    dataReplaced: "btn btn--primary",
  },
  {
    type: ERuleConfigType.EDIT,
    detected: "<\\w+[^>]*btn--primary[^>]*>",
    dataReplaced: (str) => {
      if (/delete|reset/i.test(str))
        str = str.replace("btn--primary", "btn--danger");

      if (/submit|regist|select/i.test(str))
        str = str.replace("btn--primary", "btn--tertiary");

      if (/close/i.test(str))
        str = str.replace("btn--primary", "btn--secondary");

      return str;
    },
  },
  {
    type: ERuleConfigType.EDIT,
    detected: `<%--((?<!%any%*?--%?>)%any%)+--%>`,
    dataReplaced: (str) => {
      return /<\/?\w+/.test(str) ? "" : str;
    },
  },
  {
    type: ERuleConfigType.EDIT,
    detected:
      'PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"',
    dataReplaced: "",
  },
  {
    type: ERuleConfigType.EDIT,
    detected: '<div id="contents">',
    dataReplaced: '<div id="contents" class="asis-layout">',
  },
  {
    type: ERuleConfigType.EDIT,
    detected: "<a[^>]*>",
    dataReplaced: "addClass:text--secondary",
  },
  {
    type: ERuleConfigType.EDIT,
    detected: "/WEB-INF/view/common/(?!asis)",
    dataReplaced: "/WEB-INF/view/common/asis/",
  },
  {
    type: ERuleConfigType.EDIT,
    detected:
      '<img[^>]*img_mark[^>]*>([^<]*)(%space%*<div class="back_button_area">%any%*?</div>)?',
    dataReplaced: (str, ...matches) => {
      const [title, buttonDiv] = matches;
      let href: string | undefined;
      let buttonLabel: string | undefined;
      if (buttonDiv) {
        href = buttonDiv.match(/(?<=href=')[^"]*(?='")/)?.[0];
        buttonLabel = buttonDiv.match(/(?<=value=")[^"]*(?=")/)?.[0];
      }
      return `
          <c:import url="/WEB-INF/view/common/asis/section_title.jsp">
            <c:param name="title" value="${title.trim()}"/>
            ${href ? `<c:param name="backPath" value="${href}"/>` : ""}
            ${
              buttonLabel
                ? `<c:param name="backTitle" value="${buttonLabel}"/>`
                : ""
            }
          </c:import>
      `;
    },
  },
  {
    type: ERuleConfigType.MOVE,
    detected: "<c:import[^>]*section_title[^>]*>%any%+?</c:import>",
    dataReplaced: "(?<=<!-- main_menu stop -->)",
  },
  {
    type: ERuleConfigType.EDIT,
    detected: `<ol%any%*?</ol>`,
    dataReplaced: (str) => {
      str = str.replace(
        regexParser("<ol[^>]*>"),
        `<div class="stepper__container">
            <div class="stepper">`
      );
      str = str.replace(
        regexParser("</ol>"),
        `   </div>
         </div>`
      );
      let isBeforeCurrent = true;
      str = str.replace(regexParser("<li[^>]*>%any%*?</li>"), (li) => {
        if (li.includes("current")) {
          li = li.addClasses(
            /<li[^>]*>/,
            "stepper__item stepper__item--current"
          );
          isBeforeCurrent = false;
        } else if (isBeforeCurrent)
          li = li.addClasses(
            /<li[^>]*>/,
            "stepper__item stepper__item--completed"
          );
        else li = li.addClasses(/<li[^>]*>/, "stepper__item");
        li = li.replace(/<\/?(a|em)[^>]*>/g, "");
        return li;
      });
      str = str.replace(/li|ol/g, "div");
      return str;
    },
  },
  /* <<------- Pagination */
  {
    type: ERuleConfigType.EDIT,
    detected: "(?<=<a(?:[^>])*>%space%*)&lt;&lt;",
    dataReplaced: "&lt;",
  },
  {
    type: ERuleConfigType.EDIT,
    detected: "(?<=<a(?:[^>])*>%space%*)&gt;&gt;",
    dataReplaced: "&gt;",
  },
  {
    type: ERuleConfigType.EDIT,
    detected: "<a(?:[^>])*>%space%*(&lt;|&gt;)%space%*</a>",
    dataReplaced: "addClass:pagination__item__link",
  },
  {
    type: ERuleConfigType.WRAP,
    detected: "(<a(?:[^>])*>%space%*&gt;%space%*</a>)",
    dataReplaced: `
    <li class="pagination__item pagination__item--next">
      %content%
    </li>
          `,
  },
  {
    type: ERuleConfigType.WRAP,
    detected: "(<a(?:[^>])*>%space%*&lt;%space%*</a>)",
    dataReplaced: `
    <li class="pagination__item pagination__item--prev">
        %content%
    </li>
          `,
  },
  {
    type: ERuleConfigType.WRAP,
    detected:
      "(?<=<c:if[^>]*pagerHasPrev[^>]*>%any%+?</c:if>)(%any%+?)(?=<c:if[^>]*pagerHasNext[^>]*>)",
    dataReplaced: `
    <li class="pagination__item pagination__item--asis-counter">
        %content%
      </li>
          `,
  },
  {
    type: ERuleConfigType.WRAP,
    detected:
      '(<c:if[^>]*pagerHasPrev[^>]*">%any%+?</c:if>%any%+?<c:if[^>]*pagerHasNext[^>]*>%any%+?</c:if>)',
    dataReplaced: `<ul class="pagination">
    %content%
    </ul>`,
  },
  /* Pagination------->>  */
];

export default rulesConfig;
