import { error, warning } from "./lib/chalk.js";
import { NO_OPERATION_ERROR } from "./lib/cli-errors.js";

const operation = process.argv[2];

switch (operation) {
    case "init":
    case "generate":
    case "migrate":
    case "reset":
    default:
        console.log(error(NO_OPERATION_ERROR.message));
        console.log(warning(NO_OPERATION_ERROR.description));
}
