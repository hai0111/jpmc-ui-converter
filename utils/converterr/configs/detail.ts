import { type IRuleConfig, ERuleConfigType } from "./utils";

const ruleConfigs: IRuleConfig[] = [
  {
    type: ERuleConfigType.WRAP,
    detected:
      "(?<=<c:import[^>]*section_title[^>]*>%any%*?</c:import>)(%any%+?)(?=(<!-- footer start -->)?%space%*<c:import[^>]*footer[^>]*>)",
    dataReplaced: `
    <main class="asis-main">
        <div class="asis-content asis-content--detail">
          %content%
        </div>
    </main>
        `,
  },
];

export default ruleConfigs;
