import * as fs from "fs";
import path from "path";
import * as converterConfig from "./configs";
import {
  type IRuleConfig,
  ERuleConfigType,
  regexParser,
} from "./configs/utils";

declare global {
  interface String {
    addClasses(pattern: string | RegExp, replacement: string): string;
    replaceClasses(pattern: string | RegExp, replacement: string): string;
    toNormalChar(): string;
  }
}

String.prototype.addClasses = function (pattern, classes: string) {
  let result = this.toString();

  result = result.replace(pattern, (str) => {
    const isHasClass = /class="[^"]*"/.test(str);
    const isHasCssClass = /cssClass="[^"]*"/.test(str);
    const isJspTag = /<\w+:\w+/.test(str);

    if (isHasClass) {
      str = str.replace(/class="([^"]*)"/g, (_, p1) => {
        if (p1) p1 = p1.replace(classes, "");
        return `class="${p1} ${classes}"`;
      });
    } else if (isHasCssClass) {
      str = str.replace(/cssClass="([^"]*)"/g, (_, p1) => {
        if (p1) p1 = p1.replace(classes, "");
        return `cssClass="${p1} ${classes}"`;
      });
    } else if (isJspTag) {
      str = str.replace(/<[\w:]+/g, (str) => `${str} cssClass="${classes}"`);
    } else {
      str = str.replace(/<[\w]+/g, (str) => `${str} class="${classes}"`);
    }
    return str;
  });

  return result;
};

String.prototype.replaceClasses = function (pattern, classes: string) {
  let result = this.toString();

  result = result.replace(pattern, (str) => {
    const isHasClass = /class="[^"]*"/.test(str);
    const isHasCssClass = /cssClass="[^"]*"/.test(str);
    const isJspTag = /<\w+:\w+/.test(str);

    if (isHasClass) {
      str = str.replace(/class="([^"]*)"/g, `class="${classes}"`);
    } else if (isHasCssClass) {
      str = str.replace(/cssClass="([^"]*)"/g, `cssClass="${classes}"`);
    } else if (isJspTag) {
      str = str.replace(/<[\w:]+/g, (str) => `${str} cssClass="${classes}"`);
    } else {
      str = str.replace(/<[\w]+/g, (str) => `${str} class="${classes}"`);
    }
    return str;
  });

  return result;
};

String.prototype.toNormalChar = function () {
  let result = this.toString();
  result = result.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return result;
};

export default class Converter {
  PATH_INPUT = process.env.PATH_INPUT!;
  PATH_OUTPUT = process.env.PATH_OUTPUT!;
  PATH_MATCH = "(\\list\\index|\\list).jsp$";
  DEFAULT_CONFIGS: (keyof typeof converterConfig)[] = ["common", "form"];
  CONFIGS: (keyof typeof converterConfig)[] = [];
  WRITABLE = true;
  CONTENT = "";
  IS_FORM_TABLE = false;
  IS_WINDOW = false;

  deleteRules: IRuleConfig[] = [];
  editRules: IRuleConfig[] = [];
  moveRules: IRuleConfig[] = [];
  wrapRules: IRuleConfig[] = [];

  init() {
    const configs: IRuleConfig[] = [];
    const configsName = this.DEFAULT_CONFIGS.concat(
      this.IS_FORM_TABLE ? "formTable" : "table"
    ).concat(this.CONFIGS);

    configsName.forEach((key: keyof typeof converterConfig) => {
      if (converterConfig[key]) {
        configs.push(...converterConfig[key]);
      }
    });

    this.deleteRules = [];
    this.editRules = [];
    this.moveRules = [];
    this.wrapRules = [];

    configs.forEach((item) => {
      switch (item.type) {
        case ERuleConfigType.DELETE:
          this.deleteRules.push(item);
          break;
        case ERuleConfigType.EDIT:
          this.editRules.push(item);
          break;
        case ERuleConfigType.MOVE:
          this.moveRules.push(item);
          break;
        case ERuleConfigType.WRAP:
          this.wrapRules.push(item);
          break;
      }
    });
  }

  convertPathToWindow(path: string) {
    if (path.includes("/")) {
      this.IS_WINDOW = false;
      path = path.replace(/\//g, "\\");
    }
    return path;
  }

  convertPathToOrigin(path: string) {
    if (!this.IS_WINDOW) {
      path = path.replace(/\\/g, "/");
    }
    return path;
  }

  walkDir(dir: string) {
    dir = this.convertPathToWindow(dir);
    fs.readdirSync(dir).forEach((file) => {
      const fullPath = this.convertPathToWindow(path.join(dir, file));
      if (fs.statSync(fullPath).isDirectory()) {
        this.walkDir(fullPath); // 🌀 Đệ quy nếu là folder
      } else if (new RegExp(this.PATH_MATCH).test(fullPath)) {
        this.convertFile(fullPath); // 📄 Gọi callback nếu là file
      }
    });
  }

  convertFile(path: string) {
    let content = fs.readFileSync(path, "utf8");

    if (!this.WRITABLE) {
      this.testRegex(content);
      return;
    }

    content = this.handleDelete(content);
    content = this.handleEdit(content);
    content = this.handleWrap(content);
    content = this.handleMove(content);
    content = this.handleEditWithPath(content, path);
    content = this.handleCleanUp(content);

    path = this.convertPathToOrigin(path);

    try {
      fs.writeFileSync(
        path.replace(this.PATH_INPUT, this.PATH_OUTPUT),
        content
      );
    } catch {
      fs.mkdirSync(
        path.replace(this.PATH_INPUT, this.PATH_OUTPUT).replace(/[\w\.]+$/, ""),
        { recursive: true }
      );

      fs.writeFileSync(
        path.replace(this.PATH_INPUT, this.PATH_OUTPUT),
        content
      );
    }

    console.log("✅ Done: ", path);
  }

  convertContent() {
    let content = this.CONTENT;
    content = this.handleDelete(content);
    content = this.handleEdit(content);
    content = this.handleWrap(content);
    content = this.handleMove(content);
    content = this.handleCleanUp(content);
    return content;
  }

  handleDelete(content: string) {
    this.deleteRules.forEach((dr) => {
      const regex = regexParser(dr.detected);
      const openTags = content.match(regex);

      openTags?.forEach((ot) => {
        let position: number;
        content = content.replace(ot, (_, p) => {
          position = p;
          return "";
        });
        const ct = "</" + ot.match(/\w+/)![0] + ">";
        const _ot = "<" + ot.match(/\w+/)![0];
        const regex = `${_ot}|${ct}`;
        let i = 1;
        content = content.replace(regexParser(regex), (m, p) => {
          if (p >= position) {
            if (m.startsWith("</")) i--;
            else i++;

            if (!i) return "";
          }
          return m;
        });
      });
    });

    return content;
  }

  handleEdit(content: string) {
    this.editRules.forEach((er) => {
      let isLeftover = true;
      const regex = regexParser(er.detected);
      do {
        if (
          typeof er.dataReplaced === "string" &&
          er.dataReplaced.includes("addClass:")
        ) {
          const classes = er.dataReplaced.replace("addClass:", "");
          content = content.addClasses(regex, classes);
          return;
        }

        if (
          typeof er.dataReplaced === "string" &&
          er.dataReplaced.includes("replaceClass:")
        ) {
          const classes = er.dataReplaced.replace("replaceClass:", "");
          content = content.replaceClasses(regex, classes);
          return;
        }

        content = content.replace(
          regex,
          this.getReplacer(er.dataReplaced) as any
        );
        isLeftover = regex.test(content);
      } while (isLeftover && er.isNested);
    });

    return content;
  }

  handleMove(content: string) {
    this.moveRules.forEach((mr) => {
      const regex = regexParser(mr.detected);
      const matchers = content.match(regex);
      let removed = false;
      matchers?.forEach((m) => {
        if (regexParser(mr.dataReplaced as string).test(content)) {
          if (!removed && !mr.keepOriginOnMove) {
            content = content.replace(m, "");
            removed = true;
          }
          content = content.replace(regexParser(mr.dataReplaced as string), m);
        }
      });
    });

    return content;
  }

  handleEditWithPath(content: string, path: string) {
    const parentPath = path.match(/(?<=view\\)\w+/)?.[0] || "";

    content = content.replace(
      '<c:import url="/WEB-INF/view/common/asis/menu.jsp"/>',
      `<c:import url="/WEB-INF/view/common/asis/menu.jsp">
        <c:param name="activeTab" value="${parentPath}"/>
    </c:import>`
    );
    return content;
  }

  handleWrap(content: string) {
    this.wrapRules.forEach((wr) => {
      const [openWrap] = (wr.dataReplaced as string).split(/%content%|\$\d/);

      const regexOpen = regexParser(
        openWrap.replace(regexParser("%space%*"), "%space%*")
      );

      if (regexOpen.test(content)) return;

      const regex = regexParser(wr.detected);

      content = content.replace(regex, (_, ...matchers) => {
        const content = matchers.find(
          (m) => m?.replace && m?.replace(regexParser("%space%+"), "")
        );
        return (wr.dataReplaced as string).replace(/%content%|\$\d/, content);
      });
    });

    return content;
  }

  handleCleanUp(content: string) {
    content = content.replace(regexParser("input_required"), "");
    content = content.replace(regexParser("><"), ">\n<");
    content = content.replace(regexParser("%space%*(?=</form:textarea>)"), "");
    content = content.replace(regexParser("(\n\\s*\n)+"), "\n");
    content = content.replace(regexParser("(?<=<[^>]*)\n(?=[^>]*>)"), "");
    content = content.replace(regexParser('class="([^"]*)"'), (_, p1) => {
      return `class="${p1.trim().replace(/\s+/g, " ")}"`;
    });

    content = content.replace(regexParser('cssClass="([^"]*)"'), (_, p1) => {
      return `cssClass="${p1.trim().replace(/\s+/g, " ")}"`;
    });

    content = content.replace(
      regexParser('cssErrorClass="([^"]*)"'),
      (_, p1) => {
        return `cssErrorClass="${p1.trim().replace(/\s+/g, " ")}"`;
      }
    );

    content = content.replace(
      regexParser('(?:class|cssErrorClass|cssClass)=""'),
      ""
    );
    content = content.replace(
      regexParser("(?<=<[\\w:]+[^>]*)\n(?=[^>]*>)"),
      ""
    );

    // Remove old Errors
    const customErrors = content.match(
      regexParser("<form:errors[^>]*#custom[^>]*>")
    );

    customErrors?.forEach((ce) => {
      const path = (ce.match(/(?<=path=").+?(?=")/)?.[0] || "").toNormalChar();

      const isHasOriginError = new RegExp(
        `<form:errors((?<![^>]*#custom)[^>])*${path}((?<![^>]*#custom)[^>])*>`
      ).test(content);

      if (isHasOriginError) {
        content = content.replace(
          regexParser(`<form:errors[^>]*${path}[^>]*>`),
          (str) => {
            if (!str.includes("#custom")) {
              return "";
            }
            return str;
          }
        );
      } else {
        content = content.replace(ce, "");
        content = content.replace(
          new RegExp(` \\$\{errors.hasFieldErrors[^}]*${path}[^}]*}`, "g"),
          ""
        );
      }
    });

    content = content.replace(regexParser("#custom"), "");
    return content;
  }

  getReplacer(replacer: IRuleConfig["dataReplaced"]) {
    if (!replacer) return "";
    else if (typeof replacer === "string") return replacer;
    return (_: string, ...params: any[]) => {
      return replacer(_, ...params);
    };
  }

  run() {
    this.init();
    if (new RegExp(/\w+\.\w+$/).test(this.PATH_INPUT))
      this.convertFile(this.PATH_INPUT); // 📄 Gọi callback nếu là file
    else this.walkDir(this.PATH_INPUT);
  }

  testRegex(content: string) {
    const regex = new RegExp(this.PATH_MATCH);
  }
}
