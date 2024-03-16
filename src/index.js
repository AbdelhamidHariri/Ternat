import { error, warning } from "./lib/chalk.js";
import { NO_OPERATION_ERROR } from "./lib/cli-errors.js";
import generate from "./operations/generate.js";
import init from "./operations/init.js";

const operation = process.argv[2];
const dirname = process.argv[1].split("/").slice(0, -1).join("/");
const name = process.argv[3];

switch (operation) {
    case "init":
        init(dirname);
        break;
    case "generate":
        generate(dirname, name);
        break;
    case "migrate":
    case "reset":
    default:
        console.log(error(NO_OPERATION_ERROR.message));
        console.log(warning(NO_OPERATION_ERROR.description));
}
