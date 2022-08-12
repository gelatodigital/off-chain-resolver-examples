import { BigInt } from "@polywrap/wasm-as";
import {
  Ethereum_Module,
  Logger_Logger_LogLevel,
  Logger_Module,
  Time_Module,
} from "./wrap";
import { Args_checker, CheckerResult } from "./wrap";
import { GelatoArgs } from "./wrap/GelatoArgs";
import { UserArgs } from "./wrap/UserArgs";

export function checker(args: Args_checker): CheckerResult {
  let userArgs = UserArgs.fromBuffer(args.userArgsBuffer);
  let gelatoArgs = GelatoArgs.fromBuffer(args.gelatoArgsBuffer);

  let counterAddress = userArgs.counterAddress;
  let gasPrice = gelatoArgs.gasPrice;
  let timeNowMs = Time_Module.currentTimestamp({}).unwrap();

  let canExec = false;

  logInfo(`timeNowMs: ${timeNowMs}`);
  logInfo(`gasPrice: ${gasPrice}`);
  logInfo(`counterAddress: ${counterAddress}`);

  const lastExecuted = Ethereum_Module.callContractView({
    address: counterAddress,
    method: "function lastExecuted() external view returns(uint256)",
    args: null,
    connection: args.connection,
  }).unwrap();

  let lastExecutedMs = BigInt.fromString(lastExecuted + "000");
  let fiveMinsMs = BigInt.fromString("300000");
  let nextExecTime = lastExecutedMs.add(fiveMinsMs);

  logInfo(
    `counterAddress: ${counterAddress}, lastExecuted: ${lastExecuted.toString()},`
  );

  if (timeNow.gte(nextExecTime)) canExec = true;

  const execData = Ethereum_Module.encodeFunction({
    method: "function increaseCount(uint256)",
    args: ["1"],
  }).unwrap();

  return { canExec, execData: execData };
}

function logInfo(msg: string): void {
  Logger_Module.log({
    level: Logger_Logger_LogLevel.INFO,
    message: msg,
  });
}
