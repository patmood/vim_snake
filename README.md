# WASM Snake

Vim Snake written in Go and compiled to Web Assembly

## Development

### Front end

Create a .env file with environment variables shown in .env_example

`yarn build` single build or `yarn start`for development

### WASM Code

`make` to build (also watched and built by `yarn start`)

### Firebase functions

Set environment vars:

`firebase functions:config:set score.secret="same secret as in .env"`

`cd functions` then `yarn deploy` to deploy

## TODO

[] Watch scores from db (personal and leaderboard)
[] Handle un authenticated users top score
[] Only make request if user top score (see processScore in index.js)
[] Only savescore from go if top (see "REMOVE" comments)
[] Show "i" to eat food when running over food
[] canvas image to base 64 and save
