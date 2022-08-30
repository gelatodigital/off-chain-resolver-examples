import { BigInt } from "@polywrap/wasm-as";
import { Ethereum_Module, Logger_Logger_LogLevel, Logger_Module } from "./wrap";
import { Args_checker, CheckerResult } from "./wrap";
import { GelatoArgs } from "./wrap/GelatoArgs";
import { UserArgs } from "./wrap/UserArgs";

export function checker(args: Args_checker): CheckerResult {
  let userArgs = UserArgs.fromBuffer(args.userArgsBuffer);
  let gelatoArgs = GelatoArgs.fromBuffer(args.gelatoArgsBuffer);

  let counterAddress = userArgs.counterAddress;
  let count = userArgs.count;
  let gasPrice = gelatoArgs.gasPrice;
  let timeNowSec = gelatoArgs.timeStamp;

  logInfo(`timeNowSec: ${timeNowSec}`);
  logInfo(`gasPrice: ${gasPrice}`);
  logInfo(`counterAddress: ${counterAddress}`);

  let lastExecutedString = Ethereum_Module.callContractView({
    address: counterAddress,
    method: "function lastExecuted() external view returns(uint256)",
    args: null,
    connection: args.connection,
  }).unwrap();

  let lastExecuted = BigInt.fromString(lastExecutedString);
  let fiveMin = BigInt.fromString("300");
  let nextExecTime = lastExecuted.add(fiveMin);

  logInfo(
    `counterAddress: ${counterAddress}, lastExecuted: ${lastExecuted.toString()},`
  );

  if (timeNowSec.gte(nextExecTime)) {
    let execData = Ethereum_Module.encodeFunction({
      method: "function increaseCount(uint256)",
      args: [count.toString()],
    }).unwrap();

    return { canExec: true, execData };
  }

  let execData = Ethereum_Module.solidityPack({
    types: ["string"],
    values: [
      `nextExecTime: ${nextExecTime.toString()}, timeNow: ${timeNowSec.toString()}`,
    ],
  }).unwrap();

  return { canExec: false, execData };
}

function logInfo(msg: string): void {
  Logger_Module.log({
    level: Logger_Logger_LogLevel.INFO,
    message: msg,
  });
}
