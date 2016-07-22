# gh-explore [![Build Status](https://travis-ci.org/gmontalvoriv/gh-explore.svg?branch=master)](https://travis-ci.org/gmontalvoriv/gh-explore)

> A NodeJS library for GitHub's Explore section 📣 :octocat: 🔥

## Installation

Using **npm**:

```
$ npm install --save gh-explore
```

If you don't have or don't want to use **npm**:

```
$ cd ~/.node_modules
$ git clone git://github.com/gmontalvoriv/gh-explore.git
```

## Test

Using **npm**:

```
$ npm test
```

Using **make**:

```
$ make test
```

## Usage Examples

```javascript
// Instantiate module
const ghExplore = require('gh-explore');
```

***Note: Examples shown below assume you have already instantiated a global `gh-explore` instance called `ghExplore` and exclude error-checking code for brevity.***

```javascript
ghExplore.showcases(function (err, showcases) {
  console.log(showcases);
});
```

```javascript
ghExplore.showcases.get({ showcase: 'machine-learning' }, function (err, showcase) {
  console.log(showcase);
});
```

```javascript
ghExplore.showcases.search({ query: 'security' }, function (err, showcases) {
  console.log(showcases);
});
```

```javascript
ghExplore.integrations(function (err, integrations) {
  console.log(integrations);
});
```

```javascript
ghExplore.trending(function (err, repositories) {
  console.log(respositories);
});
```

```javascript
ghExplore.trending({ type: 'developers' }, function (err, topDevelopers) {
  console.log(topDevelopers);
});
```

## Methods

### `showcases`

Fetch showcases.

`.showcases(options, callback)`

***Parameters:***

Name | Description | Type |
-----|------------ |------|
page| for pagination | `Integer` | 

### `showcases.get`

Fetch showcase information.

`.showcases.get(options, callback)`

***Parameters:***

Name | Description | Type |
-----|------------ |------|
showcase| showcase name | `String` | 
sort| sort by most starred or by language | `String` | 

### `showcases.search`

Search showcases.

`.showcases.search(options, callback)`

***Parameters:***

Name | Description | Type |
-----|------------ |------|
query| search query | `String` | 

### `integrations`

Fetch GitHub integrations.

`.integrations(options, callback)`

***Parameters:***

Name | Description | Type |
-----|------------ |------|
category| filter by category | `String` | 

### `integrations.get`

Fetch integration information.

`.integrations.get(options, callback)`

### `integrations.search`

Search integrations.

`.integrations.search(options, callback)`

***Parameters:***

Name | Description | Type |
-----|------------ |------|
query| search query | `String` | 

### `trending`

Fetch trending repositories and developers.

`.trending(options, callback)`

***Parameters:***

Name | Description | Type |
-----|------------ |------|
type| `type: 'developers'` to fetch top developers | `String` |
since| filter results by daily, weekly or monthly | `String` | 
language| filter results by language | `String` | 

***Note: Type is set to repositories by default***

## License

[MIT](https://github.com/gmontalvoriv/gh-explore/blob/master/LICENSE) © Gabriel Montalvo
