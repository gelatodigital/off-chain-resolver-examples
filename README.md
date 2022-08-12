# Examples of Polywrap Resolver

### simple-resolver

Increases a counter on a smart contract every x minutes.

### 1inch-resolver

Swaps token via 1inch router when token price is above a certain threshold.

# How To Run

## Install Dependencies

`nvm install && nvm use`  
`yarn`

## Build

`yarn build`

## Test

Configure user arguments in `src/__tests__/e2e/integration.spec.ts` and run:

`yarn test`

## Deploy Polywrap

`yarn deploy`
