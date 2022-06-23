'use strict';

const pagination = require('hexo-pagination');

const config = {
  enable: true,
  per_page: 20,
  target_dir: '_posts/section/',
  section_dir: 'sections/',
};

hexo.extend.generator.register('section', function (locals) {
  Object.assign(config, this.theme.config.section);
  if (!config.enable) return;

  const posts = locals.posts;
  const { per_page, target_dir, section_dir } = config;
  const sectionReg = new RegExp(`${target_dir}(.+)/`);

  const { data, sectionMap } = posts
    .filter(post => post.section = (sectionReg.exec(post.source) || []).at(1))
    .sort('section -date')
    .toArray()
    .reduce((tmp, post, idx, arr) => {
      tmp.push(post);
      let section = post.section;
      const next = arr.at(idx + 1);

      if (next && next.section === section) {
        post.next = next;
        next.prev = post;
      } else {
        const path = section_dir + section;
        section = section.split('/');

        tmp.data.push(...pagination(
          path,
          new posts.constructor(tmp.splice(0)),
          {
            perPage: per_page,
            layout: ['archive', 'index'],
            format: 'page/%d/',
            data: {
              section: section.at(-1)
            }
          }
        ));

        section.reduce((map, key, idx, { length }) => {
          let subMap = map.get(key);
          if (!subMap) map.set(key, subMap = new Map());
          if (idx + 1 === length) subMap.href = path;

          return subMap;
        }, tmp.sectionMap);
      }

      return tmp;
    }, Object.assign([], { data: [], sectionMap: new Map() }));

  data.push({
    path: section_dir,
    layout: ['section-index'],
    data: {
      sectionMap,
    }
  });


  return data;
});
