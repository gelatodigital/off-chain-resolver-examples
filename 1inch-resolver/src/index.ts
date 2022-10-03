import { BigInt, JSON } from "@polywrap/wasm-as";
import {
  Ethereum_Module,
  Http_Module,
  Logger_Module,
  Logger_Logger_LogLevel,
} from "./wrap";
import { Args_checker, CheckerResult, DataBigInt, DataString } from "./wrap";
import { GelatoArgs } from "./wrap/GelatoArgs";
import { UserArgs } from "./wrap/UserArgs";

export function checker(args: Args_checker): CheckerResult {
  let userArgs = UserArgs.fromBuffer(args.userArgsBuffer);
  let gelatoArgs = GelatoArgs.fromBuffer(args.gelatoArgsBuffer);

  let chainId = userArgs.chainId;
  let fromTokenAmount = userArgs.fromTokenAmount;
  let minToTokenAmount = userArgs.minToTokenAmount;
  let fromTokenAddress = userArgs.fromTokenAddress;
  let toTokenAddress = userArgs.toTokenAddress;
  let targetAddress = userArgs.targetAddress;
  let gasPrice = gelatoArgs.gasPrice;
  let timeStamp = gelatoArgs.timeStamp;

  logInfo(`chainId: ${chainId}`);
  logInfo(`fromTokenAmount: ${fromTokenAmount}`);
  logInfo(`minToTokenAmount: ${minToTokenAmount}`);
  logInfo(`fromTokenAddress: ${fromTokenAddress}`);
  logInfo(`toTokenAddress: ${toTokenAddress}`);
  logInfo(`targetAddress: ${targetAddress}`);

  let routerRes = getRouterAddress(chainId);
  let approveRes = getApproveFromTokenData(
    chainId,
    fromTokenAddress,
    fromTokenAmount
  );

  if (approveRes.errorMessage !== null)
    return { canExec: false, execData: encodeMessage(approveRes.errorMessage) };

  let quoteRes = getQuote(
    chainId,
    fromTokenAddress,
    toTokenAddress,
    fromTokenAmount
  );

  if (quoteRes.errorMessage !== null)
    return { canExec: false, execData: encodeMessage(quoteRes.errorMessage) };

  let toTokenAmount = quoteRes.data;
  if (toTokenAmount.lt(minToTokenAmount))
    return {
      canExec: false,
      execData: encodeMessage("toTokenAmount < minTokenAmount"),
    };

  let swapDataRes = getSwapData(
    chainId,
    fromTokenAddress,
    toTokenAddress,
    fromTokenAmount,
    targetAddress
  );
  if (swapDataRes.errorMessage !== null)
    return {
      canExec: false,
      execData: encodeMessage(swapDataRes.errorMessage),
    };

  /*   
  function approveAndSwap(
    address _fromTokenAddress,
    address _router,
    bytes memory _approveData,
    bytes memory _swapData
) external; */

  let execData = Ethereum_Module.encodeFunction({
    method: "function approveAndSwap(address,address,bytes,bytes) external",
    args: [fromTokenAddress, routerRes.data, approveRes.data, swapDataRes.data],
  }).unwrap();

  return { canExec: true, execData: execData };
}

function getRouterAddress(chainId: string): DataString {
  let routerAddress = "";

  let routerApi = `https://api.1inch.io/v4.0/${chainId}/approve/spender`;
  let routerApiRes = Http_Module.get({
    request: null,
    url: routerApi,
  }).unwrap();

  /* {
    "address": "0x1111111254fb6c44bac0bed2854e76f90643097d"
  } */

  if (!routerApiRes)
    return { errorMessage: "Get router api failed", data: routerAddress };
  let routerResObj = <JSON.Obj>JSON.parse(routerApiRes.body);

  let routerAddressJson = routerResObj.getValue("address");
  if (!routerAddressJson)
    return { errorMessage: "No routerAddressJson", data: routerAddress };

  routerAddress = routerAddressJson.toString();

  logInfo(`routerAddress: ${routerAddress}`);
  return { errorMessage: null, data: routerAddress };
}

function getApproveFromTokenData(
  chainId: string,
  fromTokenAddress: string,
  fromTokenAmount: BigInt
): DataString {
  let approveData = "";
  let approveApi = `https://api.1inch.io/v4.0/${chainId}/approve/transaction?tokenAddress=${fromTokenAddress}&amount=${fromTokenAmount.toString()}`;
  let approveApiRes = Http_Module.get({
    request: null,
    url: approveApi,
  }).unwrap();

  /*   
  {
    "data": "0x095ea7b30000000000000000000000001111111254fb6c44bac0bed2854e76f90643097d000000000000000000000000000000000000000000000000000000174876e800",
    "gasPrice": "203125114374",
    "to": "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    "value": "0"
  } */

  if (!approveApiRes)
    return { errorMessage: "Get approve api failed", data: approveData };
  let approveResObj = <JSON.Obj>JSON.parse(approveApiRes.body);

  let approveDataJson = approveResObj.getValue("data");
  if (!approveDataJson)
    return { errorMessage: "No approveDataJson", data: approveData };

  approveData = approveDataJson.toString();

  logInfo(`approveData: ${approveData}`);
  return { errorMessage: null, data: approveData };
}

function getQuote(
  chainId: string,
  fromTokenAddress: string,
  toTokenAddress: string,
  fromTokenAmount: BigInt
): DataBigInt {
  let quote = BigInt.ZERO;
  let quoteApi = `https://api.1inch.io/v4.0/${chainId}/quote?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${fromTokenAmount.toString()}`;
  let quoteApiRes = Http_Module.get({
    request: null,
    url: quoteApi,
  }).unwrap();

  /*   {
    "toTokenAmount": "169488101097",
    "fromTokenAmount": "100000000000000000000",
    "estimatedGas": 958962
  } */

  if (!quoteApiRes)
    return { errorMessage: "Get quote api failed", data: quote };
  let quoteResObj = <JSON.Obj>JSON.parse(quoteApiRes.body);

  let quoteResJson = quoteResObj.getValue("toTokenAmount");
  if (!quoteResJson) return { errorMessage: "No quoteResJson", data: quote };

  let quoteRes = quoteResJson.toString();

  quote = BigInt.fromString(quoteRes);

  logInfo(`toTokenAmount: ${quote}`);
  return { errorMessage: null, data: quote };
}

function getSwapData(
  chainId: string,
  fromTokenAddress: string,
  toTokenAddress: string,
  fromTokenAmount: BigInt,
  targetAddress: string
): DataString {
  let swapData = "";

  let slippage = "3";
  let swapApi = `https://api.1inch.io/v4.0/${chainId}/swap?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${fromTokenAmount}&fromAddress=${targetAddress}&slippage=${slippage}`;

  let res = Http_Module.get({
    request: null,
    url: swapApi,
  });

  if (!res || res.isErr)
    return {
      errorMessage: "Get swap api failed",
      data: swapData,
    };
  let swapApiRes = res.unwrap();
  if (!swapApiRes)
    return { errorMessage: "Get swap api res failed", data: swapData };

  let swapResObj = <JSON.Obj>JSON.parse(swapApiRes.body);
  if (swapApiRes.status == 400)
    return {
      errorMessage: "Swap api error 400",
      data: swapData,
    };

  /*
  { 
    "fromToken": {},
    "toToken": {},
    "toTokenAmount": "17041",
    "fromTokenAmount": "10000000000000",
    "protocols": [],
    "tx": {
      "from": "0xCDf41a135C65d0013393B3793F92b4FAF31032d0",
      "to": "0x1111111254fb6c44bac0bed2854e76f90643097d",
      "data": "0x7c02520000000000000000000000000013927a60c7bf4d3d00e3c1593e0ec713e35d2106000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001800000000000000000000000007ceb23fd6bc0add59e62ac25578270cff1b9f6190000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa8417400000000000000000000000034965ba0ac2451a34a0471f04cca3f990b8dea27000000000000000000000000cdf41a135c65d0013393b3793f92b4faf31032d0000000000000000000000000000000000000000000000000000009184e72a00000000000000000000000000000000000000000000000000000000000000041e600000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a4b757fed600000000000000000000000034965ba0ac2451a34a0471f04cca3f990b8dea270000000000000000000000007ceb23fd6bc0add59e62ac25578270cff1b9f6190000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa841740000000000000000002dc6c01111111254fb6c44bac0bed2854e76f90643097d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000cfee7c08",
      "value": "0",
      "gas": 235114,
      "gasPrice": "161297033108"
    }
  } */

  let txObj = swapResObj.getObj("tx");
  if (!txObj) return { errorMessage: "No tx obj", data: swapData };

  let swapDataJson = txObj.getValue("data");
  if (!swapDataJson) return { errorMessage: "No swapDataJson", data: swapData };

  swapData = swapDataJson.toString();

  logInfo(`swapData: ${swapData}`);
  return { errorMessage: null, data: swapData };
}

function logInfo(msg: string): void {
  Logger_Module.log({ message: msg, level: Logger_Logger_LogLevel.INFO });
}

function encodeMessage(msg: string | null): string {
  if (msg !== null)
    return Ethereum_Module.solidityPack({
      types: ["string"],
      values: [msg],
    }).unwrap();

  return "";
}
