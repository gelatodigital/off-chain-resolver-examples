import { encode } from "@msgpack/msgpack";
import "dotenv/config";
import { ethers } from "ethers";
import path from "path";
import { Template_CheckerResult } from "../types/wrap";
import polywrapClient from "./client";

jest.setTimeout(600000);

const POLYGON_CHAINID = "137";
const POLYGON_WETH = "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619";
const POLYGON_USDC = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
const POLYGON_RESOLVER = "0xCDf41a135C65d0013393B3793F92b4FAF31032d0";

describe("Gelato 1inch resolver test", () => {
  let wrapperUri: string;
  let userArgsBuffer: Uint8Array;
  let gelatoArgsBuffer: Uint8Array;

  beforeAll(async () => {
    const dirname: string = path.resolve(__dirname);
    const wrapperPath: string = path.join(dirname, "..", "..", "..");
    wrapperUri = `fs/${wrapperPath}/build`;

    const gelatoArgs = {
      gasPrice: ethers.utils.parseUnits("100", "gwei").toString(),
    };
    const userArgs = {
      chainId: POLYGON_CHAINID,
      fromTokenAmount: ethers.utils.parseEther("0.00001").toString(), // 0.00001 WETH
      minToTokenAmount: ethers.utils.parseUnits("0.0001", "mwei").toString(), // 2000 USDC
      fromTokenAddress: POLYGON_WETH,
      toTokenAddress: POLYGON_USDC,
      resolverAddress: POLYGON_RESOLVER,
    };

    userArgsBuffer = encode(userArgs);
    gelatoArgsBuffer = encode(gelatoArgs);
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

    const data = <Template_CheckerResult>job.data;
    console.log(job);

    // expect(data?.canExec).toEqual(false);
  });
});
