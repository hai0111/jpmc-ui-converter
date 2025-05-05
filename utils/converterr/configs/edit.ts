import { type IRuleConfig, ERuleConfigType, regexParser } from "./utils";

const ruleConfigs: IRuleConfig[] = [
  {
    type: ERuleConfigType.WRAP,
    detected:
      "(?<=<c:import[^>]*section_title[^>]*>%any%*?</c:import>)(%any%+?)(?=(<!-- footer start -->)?%space%*<c:import[^>]*footer[^>]*>)",
    dataReplaced: ` 
    <main class="asis-main asis-main--yellow">
        <div class="asis-content__wrapper">
            <div class="asis-content asis-content--edit">
                %content%
            </div>
        </div>
    </main>
        `,
  },
];

export default ruleConfigs;
