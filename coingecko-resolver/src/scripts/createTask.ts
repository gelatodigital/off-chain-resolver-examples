import "dotenv/config";
import { GelatoOpsSDK } from "@gelatonetwork/ops-sdk";
import { ethers } from "ethers";

const env = process.env;

const rpcUrl = env.RPC_URL;
const pk = <string>env.PK;
const chainId = Number(env.CHAINID);

const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const signer = new ethers.Wallet(pk, provider);

const main = async () => {
  const signerAddress = signer.address;
  console.log("Signer: ", signerAddress);

  const ops = new GelatoOpsSDK(chainId, signer);

  const oracleAbi = ["function updatePrice(uint256) external"];
  const oracleAddress = "0x18d60894309C4Ef4902655b445De1Cb2faf4CB40"; //mumbai
  const oracleInterface = new ethers.utils.Interface(oracleAbi);

  const taskName = "Coingecko oracle"; // to fill
  const execAddress = oracleAddress; // to fill
  const execSelector = oracleInterface.getSighash("updatePrice"); // to fill
  const offChainResolverHash = "QmQMTqeCiT17wEqZFZTpomHdPgQX4gy6Rv3uc5Xi7kyibM"; // to fill
  const offChainResolverArgs = { oracleAddress }; // to fill

  const res = await ops.createTask({
    name: taskName,
    execAddress,
    execSelector,
    offChainResolverHash,
    offChainResolverArgs,
  });

  console.log("tx: ", res.tx);
  console.log("taskId: ", res.taskId);
};

main();
