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
const htmlEscape = require('./helpers').htmlEscape;

const errors = ['showcase required',
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
        error: err
      });
    }

    return cb(null, scraper.load(res.body));
  });
};

(function () {
  const GhExplore = (function () {
    function GhExplore() { }

    GhExplore.apiServer = 'https://github.com';

    let showcasesRoute = GhExplore.apiServer + '/showcases';
    let integrationsRoute = GhExplore.apiServer + '/integrations';
    let trendingRoute = GhExplore.apiServer + '/trending';

    GhExplore.showcases = function (args, cb) {
      let pn = args.page_num || 1;

      if (!cb) {
        cb = args;
      }

      scrapeHTML(
        showcasesRoute + '?page=' + pn,
        function (err, jq) {
          if (err) {
            return cb(err);
          }

          let showcases = [];

          jq('div[class=exploregrid-item-header]').each(function (i) {
            let item = jq(this);

            const title = item.next().text().trim();

            const description = item.parent().children().next().first().next().text().trim();

            const repositories = Number(item.siblings('.exploregrid-item-meta')
              .children().first().text().trim().match(/\d/g).join(''));

            const languages = Number(item.siblings('.exploregrid-item-meta')
              .children().last().text().trim().match(/\d/g).join(''));

            const headerImage = item.attr('style').substring(18);

            showcases[i] = {
              title: title,
              description: description,
              repositories: repositories,
              languages: languages,
              header_image: headerImage,
            };
          });

          return cb(null, {
            page: pn,
            results: showcases
          });
        }
      );
    };

    GhExplore.showcases.get = function (args, cb) {
      if (!args.showcase) {
        throw new Error(errors[0]);
      }

      let sort = args.sort || 'stars';

      scrapeHTML(
        showcasesRoute + '/' + args.showcase + '?s=' + sort,
        function (err, jq) {
          if (err) {
            return cb(err);
          }

          let repositories = [];
          let otherShowcases = [];

          // get repositories list
          jq('.repo-list-item').each(function (i) {
            let item = jq(this);

            const author = item.find('.mb-1').children().children().first()
              .text().trim().replace(/ /g, '').replace('/', '');

            const name = item.find('.mb-1').children().contents().filter(function () {
              return this.type === 'text';
            }).text().trim();

            const avatarImage = item.find('.avatar').attr('src');

            const description = item.children().next().next().first().text().trim();

            const url = GhExplore.apiServer + item.find('.mb-1').children().attr('href');

            const language = item.children().next().next().next().find('.mr-3').first().text().trim();

            const stars = Number(item.children().children().next().next().first().text().trim().replace(/,/g, ''));

            const forks = Number(item.children().children().next().next().first().next().text().trim().replace(/,/g, ''));

            const lastUpdated = new Date(item.children().children().last().attr('datetime')).getTime() / 1000;

            repositories[i] = {
              author: author,
              name: name,
              avatar_image: avatarImage,
              description: description,
              url: url,
              language: language,
              stars: stars,
              forks: forks,
              last_updated: lastUpdated
            };
          });

          // get related and new showcases
          jq('.exploregrid-item-title').each(function (i) {
            let item = jq(this);

            const title = item.text().trim();

            const description = item.next().text().trim();

            const headerImage = item.siblings('.exploregrid-item-header').attr('style').substring(18);

            otherShowcases[i] = {
              title: title,
              description: description,
              header_image: headerImage
            };
          });

          const title = jq('.showcase-page-title').text().trim();

          const description = jq('.showcase-page-description').text().trim();

          const languages = jq('.showcase-page-meta').children().first().next().text().trim();

          const lastUpdated = new Date(
            jq('.showcase-page-meta').children().last().text().trim().substring(23).replace(/\s*$/, "")
          ).getTime() / 1000;

          const relatedShowcases = otherShowcases.slice(0, 2);

          const newShowcases = otherShowcases.slice(2);

          return cb(null, {
            title: title,
            description: description,
            repositories: repositories,
            languages: languages,
            last_updated: lastUpdated,
            related_showcases: relatedShowcases,
            new_showcases: newShowcases
          });
        }
      );
    };

    GhExplore.showcases.search = function (args, cb) {
      if (!args.query) {
        throw new Error(errors[1]);
      }

      scrapeHTML(
        showcasesRoute + '/search?q=' + args.query,
        function (err, jq) {
          if (err) {
            return cb(err);
          }

          let searchResults = [];

          jq('.collection-search-result-title').each(function (i) {
            const title = jq(this).text().trim();
            const description = jq(this).next().text().trim();

            searchResults[i] = {
              title: title,
              description: description
            };
          });

          return cb(null, {
            results: searchResults
          });
        }
      );
    };

    GhExplore.integrations = function (args, cb) {
      if (!cb) {
        cb = args;
      }

      scrapeHTML(
        integrationsRoute +
        (args.category && args.category !== 'all' ? '/feature/' + args.category : ''),
        function (err, jq) {
          if (err) {
            return cb(err);
          }

          let integrations = [];

          jq('.intgrs-lstng-item-header').each(function (i) {
            let item = jq(this);

            const title = item.text().trim();
            const description = item.next().text().trim();
            const avatarImage = item.siblings('.avatar').attr('src');

            integrations[i] = {
              title: title,
              description: description,
              avatar_image: avatarImage
            };
          });

          return cb(null, {
            category: args.category ? args.category : 'all',
            results: integrations
          });

        }
      );
    };

    GhExplore.integrations.categories = function (cb) {
      scrapeHTML(
        integrationsRoute,
        function (err, jq) {
          if (err) {
            return cb(err);
          }

          let categories = [];

          jq('.filter-item').each(function (i) {
            categories[i] = jq(this).text().trim().toLowerCase();
          });

          cb(null, {
            results: categories
          });
        }
      );
    };

    GhExplore.integrations.get = function (args, cb) {
      if (!args.integration) {
        throw new Error(errors[2]);
      }

      scrapeHTML(
        integrationsRoute + '/' + args.integration,
        function (err, jq) {
          if (err) {
            return cb(err);
          }

          let item = jq(jq(this) + ' .container-lg');

          const title = item.find('.lh-condensed').text().trim();

          const description = item.find('.mb-2').first().text().trim();

          const avatarImage = item.find('.avatar').attr('src');

          const text = htmlEscape(item.find('.markdown-body').html().trim());

          const developer = (item.find('.pb-3').next().next().next().next().text().trim()).substring(1);

          const developerUrl = GhExplore.apiServer + '/' + developer;

          return cb(null, {
            title: title,
            description: description,
            avatar_image: avatarImage,
            //text: text,
            developer: developer,
            developer_url: developerUrl,
            categories: (function () {
              let categories = jq(item + ' .mb-3').children().last().children().last()
                .find('.mb-3').first().text().trim()
                .toLowerCase().replace(/(\r\n|\n|\r)/gm, ',').split(',');

              for (let key in categories) {
                categories[key] = categories[key].trim().replace(/\s+/g, '-');
              }
           
              return categories;
            })(),
            more_info: (function () {
              let moreInfoHtml = item.find('.pb-3').next().next().html()
                .trim().replace(/(\r\n|\n|\r)/gm, '');

              let moreInfo = scraper.load(moreInfoHtml);
              let result = {};

              moreInfo('div').each(function () {
                result[moreInfo(this)
                  .children().text().toLowerCase()
                  .replace(/ /g, "_")] = moreInfo(this).children('a').attr('href');
              });

              return result;
            })()

          });
        }
      );
    };

    GhExplore.integrations.search = function (args, cb) {
      if (!args.query) {
        throw new Error(errors[1]);
      }

      scrapeHTML(
        integrationsRoute + '?query=' + args.query,
        function (err, jq) {
          if (err) {
            return cb(err);
          }

          let integrations = [];

          jq('.intgrs-lstng-item-header').each(function (i) {
            let item = jq(this);

            const title = item.text().trim();
            const description = item.next().text().trim();
            const avatarImage = item.siblings('.avatar').attr('src');

            integrations[i] = {
              title: title,
              description: description,
              avatar_image: avatarImage
            };
          });

          return cb(null, {
            results: integrations
          });

        }
      );
    };

    GhExplore.trending = function (args, cb) {

      if (!cb) {
        cb = args;
      }

      if (args.type && args.type !== 'developers') {
        throw new Error(errors[3]);
      }

      let trendingType = args.type || '';
      let since = args.since || 'daily';

      let url = trendingRoute + '/' + trendingType +
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
                let item = jq(this);

                const rank = ++i;

                const fullName = item.find('.full-name').text().trim().replace(/[()]/g, '');

                const username = item.find('.user-leaderboard-list-name')
                  .children().contents().first().text().trim();

                const avatarImage = item.children().children().attr('src');

                const trendingRepoName = item.find('.repo').text().trim();

                const trendingRepoDesc = item.find('.repo-snipit-description').text().trim();

                trendingList[i] = {
                  rank: rank,
                  full_name: fullName,
                  username: username,
                  avatar_image: avatarImage,
                  trending_repo_name: trendingRepoName,
                  trending_repo_description: trendingRepoDesc
                };
              });

              break;

            default:

              jq('.repo-list li').each(function (i) {
                let item = jq(this);

                let author = item.children().find('.text-normal').first().text().trim()
                  .replace(/ /g, '').replace('/', '');
                let repoName = item.find('.mb-1').text().trim();
                let desc = item.find('.py-1').text().trim();
                let language = item.find('.mr-3').first().text().trim();
                let stars = Number(item.find('.muted-link').first().text().trim().replace(/,/g, ''));

                trendingList[i] = {
                  author: author,
                  name: (repoName).substring(repoName.indexOf('/') + 2),
                  description: desc,
                  language: language,
                  stars: stars,
                  top_contributors: (function () {

                    let builtBy = scraper.load(item.find('.no-underline').html().trim());
                    let builtByList = [];

                    builtBy('img').each(function (i) {
                      builtByList[i] = {
                        username: builtBy(this).attr('title'),
                        avatar: builtBy(this).attr('src')
                      };
                    });

                    return builtByList;
                  } ())

                };
              });

              break;
          }

          return cb(null, {
            results: trendingList
          });
        });
    };

    return GhExplore;
  })();

  module.exports = GhExplore;

}).call(this);