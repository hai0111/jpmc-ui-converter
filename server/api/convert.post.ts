import Converter from "~/utils/converterr/converter";

export interface IConvertBody {
  configs: string[];
  pathInput: string;
  pathOutput: string;
  regex?: string;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const keysRequired = ["pathInput", "pathOutput", "configs"];
  const missingKeys = keysRequired.filter(
    (k) => !Object.keys(body).includes(k)
  );
  if (!missingKeys.length) {
    const converter = new Converter();
    converter.CONFIGS = body.configs;
    converter.PATH_INPUT = body.pathInput;
    converter.PATH_OUTPUT = body.pathOutput;
    converter.PATH_MATCH = body.regex || ".jsp$";

    converter.run();

    return {
      message: "Success",
    };
  } else throw new Error("Missing: " + missingKeys.join());
});
