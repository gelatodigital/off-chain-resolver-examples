# (BETA) Polywrap Resolver Examples

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

1. Create a `.env` file with configs:

```js
CHAINID=
RPC_URL=
```

2. Configure user arguments in `src/__tests__/e2e/integration.spec.ts` and run:

`yarn test`

## Deploy Polywrap

`yarn deploy`

## Creating a task

Polywrap feature is currently on these networks:

- mumbai

1. Create a `.env` file with configs:

```js
RPC_URL= <= for network listed above
PK=
```

2. Fill up the details in `/scripts/createTask.ts`

```js
const execAddress = ""; // target contract which gelato will call
const execDataOrSelector = ""; // signature of function which gelato will call
const userArgs = {
  arg: "", // user arguments defined in schema
};
const polywrapCid = ""; // deployed polywrap hash
```

3. `yarn createTask`

Since this feature is still in BETA, please reach out to us once the task is created, we will need to whitelist the task :)
