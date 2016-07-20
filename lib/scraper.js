/*
The MIT License (MIT)

Copyright (c) 2016 Gabriel Montalvo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict';

const request = require('request');
const scraper = require('cheerio');
const utils = require('./utils');

const errors = ['invalid arguments',
                'showcase is required',
                'query required',
                'integration required',
                'invalid value for argument type'];

let scrapeHTML = function (url, options, cb) {
  if (!cb) {
    cb = options;
  }

  request.get(url, function (err, res) {
    if (res.statusCode !== 200) {
      return cb({
        status: 'failed',
        responseStatusCode: res.statusCode,
        error: errors[0]
      });
    }

    return cb(null, scraper.load(res.body));
  });
};

(function () {
  const GhExplore = (function() {
    function GhExplore () {}

    GhExplore.apiServer = 'https://github.com';

    GhExplore.showcases = {

      route: GhExplore.apiServer + '/showcases',

      all: function (args, cb) {
        let pn = args.page_num || 1;

        if (!cb) {
          cb = args;
        }

        scrapeHTML(
          this.route + '?page=' + pn,
          function (err, jq) {
            if (err) {
              return cb(err);
            }

            let showcaseRepos = [];

            jq('div[class=exploregrid-item-header]').each(function (i) {
              let item = jq(this);

              showcaseRepos[i] = {
                title: item.next().text().trim(),

                description: item.parent().contents().filter(function () {
                  return this.type === 'text';
                }).text().trim(),

                repositories: Number(item.siblings('.exploregrid-item-meta')
                                     .children().first().text().trim().match(/\d/g).join('')),

                languages: Number(item.siblings('.exploregrid-item-meta')
                                  .children().last().text().trim().match(/\d/g).join('')),

                header: item.attr('style').substring(18),
              };
            });

            return cb(null, {
              status: 'successful',
              page: pn,
              results: showcaseRepos
            });
          }
        );
      },

      get: function (args, cb) {
        if(!args.showcase) {
          throw new Error(errors[1]);
        }

        let sort = args.sort || 'stars';

        scrapeHTML(
          this.route + '/' + args.showcase + '?s=' + sort,
          function (err, jq) {
            if (err) {
              return cb(err);
            }

            let repos = [];
            let otherShowcases = [];

            // get repositories list
            jq('.repo-list-item').each(function (i) {
              let item = jq(this);

              repos[i] = {
                author: item.find('.repo-list-name').children().children().first().text().trim(),

                name: item.find('.repo-list-name').children().contents().filter(function () {
                  return this.type === 'text';
                }).text().trim(),

                avatar_image: item.find('.avatar').attr('src'),

                description: item.children().last().text().trim(),

                language: item.children().first().contents().filter(function () {
                  return this.type === 'text';
                }).text().trim(),

                stars: Number(item.children().children().first().contents().text().trim().replace(/,/g, '')),

                forks: Number(item.children().children().next().contents().text().trim().replace(/,/g, ''))
              };
            });

            // get related and new showcases
            jq('.exploregrid-item-title').each(function (i) {
              let item = jq(this);

              otherShowcases[i] = {
                title: item.text().trim(),
                description: item.next().text().trim(),
                header: item.siblings('.exploregrid-item-header').attr('style').substring(18)
              };
            });

            return cb(null, {
              status: 'successful',

              title: jq('.showcase-page-title').text().trim(),

              description: jq('.showcase-page-description').text().trim(),

              repositories: repos,

              languages: jq('.showcase-page-meta').children().first().next().text().trim(),

              last_updated: new Date(
                jq('.showcase-page-meta').children().last().text().trim().substring(23).replace(/\s*$/,"")
              ).getTime() / 1000,

              related_showcases: otherShowcases.slice(0, 2),

              new_showcases: otherShowcases.slice(2)
            });
          }
        );
      },

      search: function (args, cb) {
        if (!args.query) {
          throw new Error(errors[2]);
        }

        scrapeHTML(
          this.route + '/search?q=' + args.query,
          function (err, jq) {
            if (err) {
              return cb(err);
            }

            let searchResults = [];

            jq('.collection-search-result-title').each(function (i) {
              searchResults[i] = {
                title: jq(this).text().trim(),
                description: jq(this).next().text().trim()
              };
            });

            return cb(null, {
              status: 'successful',
              results: searchResults
            });
          }
        );
      }
    };

    GhExplore.integrations = {
      route: GhExplore.apiServer + '/integrations',
      categories: function (cb) {
        scrapeHTML(
          this.route,
          function (err, jq) {
            if (err) {
              return cb(err);
            }

            let categories = [];

            jq('.filter-item').each(function (i) {
              categories[i] = jq(this).text().trim().toLowerCase();
            });

            cb(null, {
              status: 'successful',
              results: categories
            });
          }
        );
      },

      all: function (args, cb) {
        if (!cb) {
          cb = args;
        }

        scrapeHTML(
          this.route +
            (args.category ? '/feature/' + args.category : ''),
          function (err, jq) {
            if (err) {
              return cb(err);
            }

            let integrations = [];

            jq('.intgrs-lstng-item-header').each(function (i) {
              let item = jq(this);

              integrations[i] = {
                avatar: item.siblings('.avatar').attr('src'),
                title: item.text().trim(),
                description: item.next().text().trim()
              };
            });

            return cb(null, {
              status: 'successful',
              category: args.category ? args.category : 'all',
              results: integrations
            });

          }
        );
      },

      get: function (args, cb) {
        if (!args.integration) {
          throw new Error(errors[3]);
        }

        scrapeHTML(
          this.route + '/' + args.integration,
          function (err, jq) {
            if (err) {
              return cb(err);
            }

            let item = jq(this);

            return cb(null, {
              title: jq(item + ' .intgr-header')
                .children().next().first().text().trim(),

              description: jq(item + ' .intgr-header')
                .children().last().contents().text().trim(),

              avatar: jq(item + '.avatar').attr('src'),

              text: utils.htmlEscape(jq(item + ' .markdown-body').html().trim()),

              developer: jq(item + ' .intgr-info-list')
                .children().next().next().first().next()
                .next().next().text().trim().substring(1),

              developer_url: GhExplore.apiServer +
                '/' + jq(item + ' .intgr-info-list')
                .children().next().next().first().next()
                .next().next().text().trim().substring(1),

              categories: (function () {
                let categories = jq(item + ' .intgr-info-list')
                    .first().children().next().first().text()
                    .trim().toLowerCase().replace(/(\r\n|\n|\r)/gm, ',').split(',');

                for (let key in categories) {
                  categories[key] = categories[key].trim().replace(/\s+/g, '-');
                }

                return categories;
              })(),

              more_info: (function () {
                let moreInfoHtml = jq(item + '.intgr-info-list')
                    .children().next().next().next().html()
                    .trim().replace(/(\r\n|\n|\r)/gm, '');

                let moreInfo = scraper.load(moreInfoHtml);
                let result = {};

                moreInfo('li').each(function () {
                  result[moreInfo(this)
                         .children().text().toLowerCase()
                         .replace(/ /g,"_")] = moreInfo(this).children('a').attr('href');
                });

                return result;
              })()

            });
          }
        );
      },

      search: function (args, cb) {
        if (!args.query) {
          throw new Error(errors[2]);
        }

        scrapeHTML(
          this.route + '?query=' + args.query,
          function (err, jq) {
            if (err) {
              return cb(err);
            }

            let integrations = [];

            jq('.intgrs-lstng-item-header').each(function (i) {
              let item = jq(this);

              integrations[i] = {
                avatar: item.siblings('.avatar').attr('src'),
                title: item.text().trim(),
                description: item.next().text().trim()
              };
            });

            return cb(null, {
              status: 'successful',
              results: integrations
            });

          }
        );
      }
    };

    GhExplore.trending = function (args, cb) {

      if (!cb) {
        cb = args;
      }

      if (args.type && args.type !== 'developers') {
        throw new Error(errors[4]);
      }

      let trendingType = args.type || '';
      let since = args.since || 'daily';

      let url = GhExplore.apiServer + '/trending' + '/' + trendingType +
          (args.language ? '/' + args.language : '') + '?since=' + since;

      scrapeHTML(
        url,
        function (err, jq) {
          if (err) {
            return cb(err);
          }

          let trendingList = [];

          switch (trendingType) {

          case 'developers':

            jq('.user-leaderboard-list li').each(function (i) {
              let leaderboardItem = jq(this);

              trendingList[i] = {
                rank: ++i,

                full_name: leaderboardItem.find('.full-name').text().trim().replace(/[()]/g, ''),

                username: leaderboardItem.find('.user-leaderboard-list-name')
                  .children().contents().first().text().trim(),

                avatar: leaderboardItem.children().children().attr('src'),

                trending_repo_name: leaderboardItem.find('.repo').text().trim(),

                trending_repo_description: leaderboardItem.find('.repo-snipit-description')
                  .text().trim()
              };
            });

            break;

          default:

            jq('.repo-list li').each(function (i) {
              let item = jq(this);

              let meta = item.find('.repo-list-meta').text().trim()
                  .toLowerCase().replace(/(\r\n|\n|\r)/gm, '')
                  .replace(/\s+/g, '');

              let metaItems = meta.match(/•/g).length;

              trendingList[i] = {
                author: item.find('.prefix').text().trim(),

                name: item.find('.repo-list-name')
                  .children().contents().last().text().trim(),

                description: item.find('.repo-list-description').text().trim(),

                language: (function () {
                  if (metaItems === 1) {
                    return '';
                  }

                  return meta.substring(0, meta.indexOf('•'));
                }()),

                stars: (function () {
                  if (metaItems === 1) {
                    return Number(meta.substring(0, meta.indexOf('•')).match(/\d/g).join(''));
                  }

                  return Number(meta.substring(meta.indexOf('•') + 1, meta.lastIndexOf('•')).match(/\d/g).join(''));
                }()),

                built_by: (function () {

                  let builtBy = scraper.load(item.find('.repo-list-meta').children().html().trim());
                  let builtByList = [];

                  builtBy('img').each(function (i) {
                    builtByList[i] = {
                      username: builtBy(this).attr('title'),
                      avatar: builtBy(this).attr('src')
                    };
                  });

                  return builtByList;
                }())
              };
            });

            break;
          }

          return cb(null, { status: 'successful', trending_list: trendingList });
        });
    };

    return GhExplore;
  })();

  module.exports = GhExplore;

}).call(this);
