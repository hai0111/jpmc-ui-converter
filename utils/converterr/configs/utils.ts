export enum ERuleConfigType {
  DELETE,
  EDIT,
  MOVE,
  WRAP,
}
export interface IRuleConfig {
  type: ERuleConfigType;
  isNested?: boolean;
  keepOriginOnMove?: boolean;
  detected: string;
  test?: boolean;
  dataReplaced?: ((match: string, ...substring: string[]) => string) | string;
}

export const classRgx = 'class="[^"]*"';
export const spaceRgx = "[\n\\s\t\r]";
export const anyRgx = "[\\s\\S]";
export const before = `(?:<c:(?!(?:choose|when|otherwise))[^>]+((?<!/)>)|<[%!]--((?<!${anyRgx}--%?>)${anyRgx})+?--%?>|&nbsp;|${spaceRgx})`;
export const after = `(?:</c:(?!(?:choose|when|otherwise))[^>]+>|<[%!]--((?<!${anyRgx}--%?>)${anyRgx})+?--%?>|&nbsp;|${spaceRgx})`;

export const regexParser = (
  rgx: string,
  { isGlobal = true }: { isGlobal?: boolean } = {}
) => {
  rgx = rgx.replace(/%class%/g, classRgx);
  rgx = rgx.replace(/%space%/g, spaceRgx);
  rgx = rgx.replace(/%any%/g, anyRgx);
  rgx = rgx.replace(/%before%/g, before);
  rgx = rgx.replace(/%after%/g, after);
  return new RegExp(rgx, isGlobal ? "g" : undefined);
};

export const selectElement = (
  origin: string,
  regexStr: string,
  { index }: { index: number | undefined } = { index: 0 }
) => {
  let result;

  origin = origin.slice(index);

  const firsMatch = origin.match(
    regexParser(regexStr.toNormalChar(), { isGlobal: false })
  );

  if (!firsMatch) return null;
  const firsMatchStr = firsMatch[0];

  const tagName = firsMatchStr
    .toNormalChar()
    .match(/(?<=<)\w+(?=[\s>])/)?.[0] as string;

  const startPoint = firsMatchStr;
  const endPoint = `</${tagName}[^>]*>(?:%after%|</c:\\w+[^>]*>)*`;

  const openTagRgx = getOpenTagRgx(firsMatchStr);

  const closeTagRgx = getCloseTagRgx(firsMatchStr);

  let regex = startPoint.toNormalChar();

  do {
    regex += `%any%*?${endPoint}`;
    result = origin.match(regexParser(regex, { isGlobal: false }))?.[0] || null;
    if (!result) break;

    const openTagCount = result
      .match(regexParser(`(${openTagRgx})+`))
      ?.reduce((result, str) => {
        let increaseNumber = 0;
        str = str.replace(
          regexParser(
            `(%before%*<c:[^>]*>${openTagRgx}</c:[^>]*>%after%*){2,}`
          ),
          () => {
            increaseNumber++;
            return "";
          }
        );

        str = str.replace(
          regexParser(`<c:[^>]*>${openTagRgx}</c:[^>]*>`),
          () => {
            return "";
          }
        );

        increaseNumber += str.match(regexParser(openTagRgx))?.length || 0;

        return result + increaseNumber;
      }, 0);

    const closeTagCount = result
      .match(regexParser(closeTagRgx))
      ?.reduce((result, str) => {
        let increaseNumber = 0;

        str = str.replace(
          regexParser(
            `(%before%*<c:[^>]*>${closeTagRgx}</c:[^>]*>%after%*){2,}`
          ),
          () => {
            increaseNumber++;
            return "";
          }
        );

        str = str.replace(
          regexParser(`<c:[^>]*>${closeTagRgx}</c:[^>]*>`),
          () => {
            return "";
          }
        );

        increaseNumber += str.match(regexParser(closeTagRgx))?.length || 0;

        return result + increaseNumber;
      }, 0);

    if (openTagCount == closeTagCount) break;
  } while (result);

  return result || null;
};

export const selectAllElement = (origin: string, regexStr: string) => {
  const result: string[] = [];
  let matched;
  do {
    matched = origin.match(regexParser(regexStr, { isGlobal: false }));

    if (!matched) break;

    const matchedStr = origin.match(
      regexParser(
        `(?:%before%|<c:\\w+[^>]*>)*${matched[0].toNormalChar()}(?:%after%|</c:\\w+[^>]*>)*`,
        { isGlobal: false }
      )
    )![0];

    const index = (matched.index || 0) + matched[0].length;

    const element = selectElement(origin, matchedStr);

    if (element) {
      result.push(element);
      origin = origin.replace(element, "");
    } else origin = origin.slice(index);
  } while (matched);

  return result;
};

export const getOpenTagRgx = (
  regexStr: string,
  tagName: string | undefined = regexStr.match(
    /(?<=<)\w+(?=[\s>])/
  )?.[0] as string
) => {
  let regex = `(?:%before%|<c:\\w+[^>]*>)*<${tagName}[^>]*>(?:%after%|</c:\\w+[^>]*>)*`;
  return regex;
};

export const getCloseTagRgx = (
  regexStr: string,
  tagName: string | undefined = regexStr.match(
    /(?<=<)\w+(?=[\s>])/
  )?.[0] as string
) => {
  let regex = `(?:%before%|<c:\\w+[^>]*>)*</${tagName}[^>]*>(?:%after%|</c:\\w+[^>]*>)*`;
  return regex;
};

export const getReplacer = (replacer: IRuleConfig["dataReplaced"]) => {
  if (!replacer) return "";
  else if (typeof replacer === "string") return replacer;
  return (_: string, ...params: any[]) => {
    return replacer(_, ...params);
  };
};
