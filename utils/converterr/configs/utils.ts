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

export const regexParser = (rgx: string) => {
  rgx = rgx.replace(/%class%/g, classRgx);
  rgx = rgx.replace(/%space%/g, spaceRgx);
  rgx = rgx.replace(/%any%/g, anyRgx);
  rgx = rgx.replace(/%before%/g, before);
  rgx = rgx.replace(/%after%/g, after);
  return new RegExp(rgx, "g");
};

export const selectElement = (
  origin: string,
  regexStr: string,
  index: number | undefined = 0
) => {
  let result;

  origin = origin.slice(index);

  const tagName = regexStr.match(/(?<=<)\w+/)?.[0] as string;

  const openTagRgx = `((%before%+<${tagName}[^>]*>%after%+)+|<${tagName}[^>]*>)`;
  const closeTagRgx = `</${tagName}>`;

  let regex = `((%before%+<${tagName}[^>]*>%after%+)*(%before%+${regexStr}%after%+)+(%before%+<${tagName}[^>]*>%after%+)*|${regexStr})`;

  do {
    regex += `%any%*?${closeTagRgx}`;
    result = origin.match(regexParser(regex))?.[0] || "";
    const openTagCount = result.match(regexParser(openTagRgx))?.length || 0;
    const closeTagCount = result.match(regexParser(closeTagRgx))?.length || 0;
    if (openTagCount == closeTagCount) break;
  } while (result);

  return result;
};

export const selectAllElement = (origin: string, regexStr: string) => {
  const result: string[] = [];
  let matched;
  do {
    matched = origin.match(regexParser(regexStr))?.[0].toNormalChar();
    if (matched) {
      const element = selectElement(origin, matched);
      if (element) {
        result.push(element);
        origin = origin.replace(element, "");
      }
    }
  } while (matched);
  return result;
};

export const getOpenTagRgx = (regexStr: string) => {
  const tagName = regexStr.match(/(?<=<)\w+/)?.[0] as string;
  let regex = `((%before%+<${tagName}[^>]*>%after%+)*(%before%+${regexStr}%after%+)+(%before%+<${tagName}[^>]*>%after%+)*|${regexStr})`;
  return regex;
};

export const getReplacer = (replacer: IRuleConfig["dataReplaced"]) => {
  if (!replacer) return "";
  else if (typeof replacer === "string") return replacer;
  return (_: string, ...params: any[]) => {
    return replacer(_, ...params);
  };
};
