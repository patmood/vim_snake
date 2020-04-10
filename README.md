# WASM Snake

Vim Snake written in Go and compiled to Web Assembly

## Development

Create a .env file with environment variables shown in .env_example

`yarn start`

To deploy firebase function:

`firebase functions:config:set score.secret="same secret as in .env"`

`cd functions` then `yarn deploy`

## TODO

[] Show "i" to eat food when running over food
[] canvas image to base 64 and save
