# (BETA) Gelato Off-chain Resolver Examples

### counter-resolver

Increases a counter on a smart contract every x minutes.

### 1inch-resolver

Swaps token via 1inch router when token price is above a certain threshold.

## Install Dependencies

`nvm install && nvm use`  
`yarn`

## Build

`yarn build`

## Test

Create a `.env` file with configs:

```typescript
CHAINID=
RPC_URL=
```

`yarn test`
