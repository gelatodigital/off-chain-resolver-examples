import { encode } from "@msgpack/msgpack";
import "dotenv/config";
import { Contract, ethers } from "ethers";
import path from "path";
import { Template_CheckerResult } from "../types/wrap";
import { UserArgs } from "../../wrap/UserArgs";
import polywrapClient from "./client";

jest.setTimeout(60000);

const counterAbi = ["function increaseCount(uint256) external"];
const counterAddress = "0x04bDBB7eF8C17117d8Ef884029c268b7BecB2a19"; //mumbai

describe("Gelato simple resolver test", () => {
  let wrapperUri: string;
  let userArgsBuffer: Uint8Array;
  let gelatoArgsBuffer: Uint8Array;
  let expected: Template_CheckerResult;
  let checker: Contract;

  beforeAll(async () => {
    const dirname: string = path.resolve(__dirname);
    const wrapperPath: string = path.join(dirname, "..", "..", "..");
    wrapperUri = `fs/${wrapperPath}/build`;

    const gelatoArgs = {
      gasPrice: ethers.utils.parseUnits("100", "gwei").toString(),
      futureArgs: 123,
    };
    const userArgs: UserArgs = {
      counterAddress,
    };

    checker = new ethers.Contract(counterAddress, counterAbi);

    userArgsBuffer = encode(userArgs);
    gelatoArgsBuffer = encode(gelatoArgs);

    const expectedExecData = checker.interface.encodeFunctionData(
      "increaseCount",
      [1]
    );
    expected = {
      canExec: true,
      execData: expectedExecData,
    };
  });

  it("calls checker", async () => {
    const job = await polywrapClient.invoke({
      uri: wrapperUri,
      method: "checker",
      args: {
        userArgsBuffer,
        gelatoArgsBuffer,
      },
    });

    const error = job.error;
    const data = <Template_CheckerResult>job.data;

    expect(error).toBeFalsy();
    expect(data?.canExec).toEqual(expected.canExec);
    expect(data?.execData).toEqual(expected.execData);
  });
});
