import { type IRuleConfig, ERuleConfigType, regexParser } from "./utils";

const ruleConfigs: IRuleConfig[] = [
  {
    type: ERuleConfigType.WRAP,
    detected:
      "(?<=<c:import[^>]*section_title[^>]*>%any%*?</c:import>)(%any%+?)(?=(<!-- footer start -->)?%space%*<c:import[^>]*footer[^>]*>)",
    dataReplaced: ` 
    <main class="asis-main">
        <div class="asis-content asis-content--list">
          %content%
        </div>
    </main>
        `,
  },
  {
    type: ERuleConfigType.EDIT,
    detected:
      "<div[^>]*header_title[^>]*>%space%*<p>([^<]+?)</p>%space%*</div>",
    dataReplaced: `<div class="asis-content__list__header">
    <div class="asis-content__list__header__left">
        <p class="heading heading--14">$1</p>
    </div>
</div>
        `,
  },
];

export default ruleConfigs;
