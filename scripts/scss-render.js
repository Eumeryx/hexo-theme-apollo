'use strict';

const { dirname } = require('path');
const { compileString } = require("sass");

hexo.extend.renderer.register('scss', 'css', function({text, path}) {
  text = Object.entries(this.theme.config.style || {})
    .reduce((text, [key, value]) => `$${key}: ${value};\n` + text, text);

  const result = compileString(text, { style: 'compressed', loadPaths: [dirname(path)] });
  
  return result.css.toString();
}, true);
