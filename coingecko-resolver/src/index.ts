import { BigInt, JSON } from "@polywrap/wasm-as";
import {
  Ethereum_Module,
  Http_Module,
  Logger_Logger_LogLevel,
  Logger_Module,
} from "./wrap";
import { Args_checker, CheckerResult } from "./wrap";
import { GelatoArgs } from "./wrap/GelatoArgs";
import { UserArgs } from "./wrap/UserArgs";

export function checker(args: Args_checker): CheckerResult {
  let userArgs = UserArgs.fromBuffer(args.userArgsBuffer);
  let gelatoArgs = GelatoArgs.fromBuffer(args.gelatoArgsBuffer);

  let gasPrice = gelatoArgs.gasPrice;
  let timeNowSec = gelatoArgs.timeStamp;
  let oracleAddress = userArgs.oracleAddress;

  let lastUpdatedString = Ethereum_Module.callContractView({
    address: oracleAddress,
    method: "function lastUpdated() external view returns(uint256)",
    args: null,
    connection: args.connection,
  }).unwrap();

  let lastUpdated = BigInt.fromString(lastUpdatedString);
  let fiveMin = BigInt.fromString("300");
  let nextUpdateTime = lastUpdated.add(fiveMin);

  logInfo(`nextUpdateTime: ${nextUpdateTime}, timeNow: ${timeNowSec}`);

  if (timeNowSec.lt(nextUpdateTime))
    return {
      canExec: false,
      execData: encodeMessage(
        `Time not elapsed, nextUpdateTime: ${nextUpdateTime.toString()}`
      ),
    };

  let res = Http_Module.get({
    request: null,
    url: "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
  }).unwrap();

  if (!res)
    return {
      canExec: false,
      execData: encodeMessage("Get coingecko api failed"),
    };
  let resObj = <JSON.Obj>JSON.parse(res.body);

  let ethKey = resObj.getObj("ethereum");
  if (!ethKey)
    return {
      canExec: false,
      execData: encodeMessage("No key: ethereum"),
    };

  let usdVal = ethKey.getValue("usd");
  if (!usdVal)
    return {
      canExec: false,
      execData: encodeMessage("No value: usd"),
    };
  let ethUsdString = usdVal.toString();
  let ethUsdFlooredString = ethUsdString.split(".")[0];

  logInfo(`ethUsd: ${ethUsdFlooredString}`);

  let execData = Ethereum_Module.encodeFunction({
    method: "function updatePrice(uint256)",
    args: [ethUsdFlooredString],
  }).unwrap();

  return { canExec: true, execData };
}

function logInfo(msg: string): void {
  Logger_Module.log({
    level: Logger_Logger_LogLevel.INFO,
    message: msg,
  });
}

function encodeMessage(msg: string): string {
  return Ethereum_Module.solidityPack({
    types: ["string"],
    values: [msg],
  }).unwrap();
}
