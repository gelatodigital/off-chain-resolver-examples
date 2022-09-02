# (BETA) Gelato Off-chain Resolver Examples

Template for off-chain resolver can be found in this [repo](https://github.com/gelatodigital/off-chain-resolver-template).

### counter-resolver

Increases a counter on a smart contract every x minutes.

### 1inch-resolver

Swaps token via 1inch router when token price is above a certain threshold.

### coingecko-resolver

Updates eth-usd price on a oracle contract every x minutes.

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
