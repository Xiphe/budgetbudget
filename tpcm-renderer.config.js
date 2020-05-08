const { dirname } = require('path');
const sass = require('sass');

module.exports = (css, { fileName, logger }) => {
  try {
    return (
      sass
        .renderSync({
          indentedSyntax: false,
          includePaths: [dirname(fileName), 'node_modules'],
          data: css.replace(/(@import ['"])~(?!\/)/gm, '$1'),
        })
        .css.toString()
        /* the :global irritates the class extraction */
        .replace(/:global.focus-visible/gm, '')
    );
  } catch (error) {
    logger.error(error.message);
  }
};
