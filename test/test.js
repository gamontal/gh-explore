'use strict';

const ghExplore = require('../');
const should = require('should');


describe('Showcases:', function () {

  it('GET /showcases', function (done) {
    ghExplore.showcases.all(function (err, res) {
      try {
        should(res).have.property('status', 'successful');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('GET /showcases?page=<page_num>', function (done) {
    ghExplore.showcases.all({ page_num: 2 }, function (err, res) {
      try {
        should(res).have.property('page', 2);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('GET /showcases/<showcase_name>', function (done) {
    ghExplore.showcases.get({ showcase: 'machine-learning' }, function (err, res) {
      try {
        should(res).have.property('status', 'successful');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('GET /showcases/<showcase_name>?s=stars', function (done) {
    ghExplore.showcases.get({ showcase: 'machine-learning', sort: 'stars' }, function (err, res) {
      try {
        should(res).have.property('status', 'successful');
        done();
        } catch (e) {
          done(e);
        }
    });
  });

  it('GET /showcases/<showcase_name>?s=language', function (done) {
    ghExplore.showcases.get({ showcase: 'machine-learning', sort: 'language' }, function (err, res) {
      try {
        should(res).have.property('status', 'successful');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('GET /showcases/search?q=<query>', function (done) {
    ghExplore.showcases.search({ query: 'machine learning' }, function (err, res) {
      try {
        should(res).have.property('status', 'successful');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('/showcases/<bad_showcase_name> -> should fail', function (done) {
    ghExplore.showcases.get({ showcase: 'bad-showcase' }, function (err, res) {
      try {
        should(err).have.property('status', 'failed');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

});


describe('Integrations:', function () {

  it('GET /integrations', function (done) {
    ghExplore.integrations.all(function (err, res) {
      try {
        should(res).have.property('status', 'successful');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('GET /integrations/feature/<category>', function (done) {
    ghExplore.integrations.all({ category: 'all' }, function (err, res) {
      try {
        should(res).have.property('status', 'successful');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('GET /integrations/<integration_name>', function (done) {
    ghExplore.integrations.get({ integration: 'travis-ci' }, function (err, res) {
      try {
        should(res).have.property('status', 'successful');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('GET /integrations?query=<query>', function (done) {
    ghExplore.integrations.search({ query: 'travis' }, function (err, res) {
      try {
        should(res).have.property('status', 'successful');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('/integrations/feature/<bad_category> -> should fail', function (done) {
    ghExplore.integrations.all({ category: 'bad-category' }, function (err, res) {
      try {
        should(err).have.property('status', 'failed');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('/integrations/<bad_integration_name> -> should fail', function (done) {
    ghExplore.integrations.get({ integration: 'bad-integration' }, function (err, res) {
      try {
        should(err).have.property('status', 'failed');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

});

describe('Trending:', function () {

  it('GET /trending', function (done) {
    ghExplore.trending(function (err, res) {
      try {
        should(res).have.property('status', 'successful');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('GET /trending?since=daily', function (done) {
    ghExplore.trending({ since: 'daily' }, function (err, res) {
      try {
        should(res).have.property('status', 'successful');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('GET /trending?since=weekly', function (done) {
    ghExplore.trending({ since: 'weekly' }, function (err, res) {
      try {
        should(res).have.property('status', 'successful');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('GET /trending?since=monthly', function (done) {
    ghExplore.trending({ since: 'monthly' }, function (err, res) {
      try {
        should(res).have.property('status', 'successful');
          done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('GET /trending/<language>', function (done) {
    ghExplore.trending({ language: 'java' }, function (err, res) {
      try {
        should(res).have.property('status', 'successful');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('GET /trending/developers', function (done) {
    ghExplore.trending({ type: 'developers' }, function (err, res) {
      try {
        should(res).have.property('status', 'successful');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('GET /trending/developers?since=daily', function (done) {
    ghExplore.trending({ type: 'developers', since: 'daily' }, function (err, res) {
      try {
        should(res).have.property('status', 'successful');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('GET /trending/developers?since=weekly', function (done) {
    ghExplore.trending({ type: 'developers', since: 'weekly' }, function (err, res) {
      try {
        should(res).have.property('status', 'successful');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('GET /trending/developers?since=monthly', function (done) {
    ghExplore.trending({ type: 'developers', since: 'monthly' }, function (err, res) {
      try {
        should(res).have.property('status', 'successful');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('GET /trending/developers/<language>', function (done) {
    ghExplore.trending({ type: 'developers', language: 'java' }, function (err, res) {
      try {
        should(res).have.property('status', 'successful');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

});
