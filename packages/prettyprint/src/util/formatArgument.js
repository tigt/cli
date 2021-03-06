const formatJS = require("./formatJS");
const toCode = require("./toCode");
const STATEMENTS = ["for", "while", "if"];

module.exports = function(node, printContext) {
  let code = node.argument;

  if (!code) {
    return "()";
  }

  code = `(${toCode(code, printContext)})`;

  let statement;
  let isParams = false;

  if (node.type === "HTMLAttribute") {
    statement = getStatementName(node.name);
  } else {
    const taglibLookup = printContext.taglibLookup;
    const tagName = node.tagName;

    if (taglibLookup && tagName) {
      const tagDef = taglibLookup.getTag(tagName);

      if (tagDef) {
        const featureFlags = tagDef.featureFlags;
        isParams = featureFlags && featureFlags.includes("params");
      }
    }

    statement = getStatementName(tagName);
  }

  try {
    if (STATEMENTS.includes(statement)) {
      return formatJS(`${statement + code};`, printContext).slice(
        statement.length + 1,
        -1
      );
    }

    if (isParams) {
      code = formatJS(`${code}=>{}`, printContext, true);

      if (code[0] === "(") {
        // Match `(x, y) => `
        code = code.slice(1, -7);
      } else {
        // Match `x => `
        code = code.slice(0, -6);
      }

      return `(${code})`;
    }

    return formatJS(`_${code}`, printContext, true).slice(1);
  } catch (_) {
    return code;
  }
};

function getStatementName(name) {
  switch (name) {
    case "if":
    case "for":
    case "while":
      return name;
    case "else-if":
    case "until":
      return "if";
    default:
      return;
  }
}
