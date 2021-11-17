const htmlparser = require("htmlparser2");

function getTailwindClasses(code) {
  let isValidHtml = false;
  let tailwindClasses = "";
  let insideStyleTag = false;
  let counter = 1;
  const parser = new htmlparser.Parser({
    onopentag(name, attributes) {
      // Found a tag, the structure is now confirmed as HTML
      isValidHtml = true;
      containsTailwind = false;

      // Test if current tag contains a class attribute
      if (attributes.class) {
        tailwindClasses += inlineTailwindClassesToMockClass(
          counter,
          attributes.class
        );
        counter++;
      }

      if (name === "style") {
        insideStyleTag = true;
      }
    },

    onclosetag(name) {
      if (name === "style") {
        insideStyleTag = false;
      }
    },

    ontext(text) {
      if (insideStyleTag) {
        const appliedStyles = [...text.matchAll(/@apply([\s\S]*?);/g)];
        if (appliedStyles) {
          appliedStyles.forEach((s) => {
            tailwindClasses += inlineTailwindClassesToMockClass(counter, s[1]);
            counter++;
          });
        }
        tailwindClasses += text;
      }
    },
  });
  parser.parseComplete(code);

  return isValidHtml ? tailwindClasses : code;
}

const removeBreakpoints = (tailwindClass) => {
  return tailwindClass.replace(/.\w:/g, "");
};

const inlineTailwindClassesToMockClass = (counter, inlineClasses) => {
  const internalStyles = inlineClasses
    .split(" ")
    .filter((tailwindClass) => tailwindClass && tailwindClass !== "\n")
    .map((tailwindClass) => {
      return (
        removeBreakpoints(tailwindClass.replace(/(\r\n|\n|\r)/gm, "")) + ":;\n"
      ); // remove new line chars
    })
    .join("");
  return wrapStylesInClass(counter, internalStyles);
};

const wrapStylesInClass = (counter, styles) => {
  return `.${counter} {\n${styles}};\n`;
};

module.exports = function () {
  return {
    code(code) {
      const result = getTailwindClasses(code);
      return result;
    },

    result(result) {
      // remove line numbers as we cannot reliably gather them for each error
      result.warnings.map((warning) => {
        warning.line = 0;
        warning.column = 0;
      });
      return result;
    },
  };
};
