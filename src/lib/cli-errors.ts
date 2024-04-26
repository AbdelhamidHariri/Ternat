import { OPERATIONS } from "./constants";

export const NO_OPERATION_ERROR = {
  message: `No operation Specified`,
  description: `Please specify one of the following operations\n\n${OPERATIONS.reduce(
    (acc, operation) => (acc ? `${acc}${operation}\n` : `${operation}\n`),
    ""
  )}`,
};
