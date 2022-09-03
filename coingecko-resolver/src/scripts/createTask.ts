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
  const oracleAddress = "0x18d60894309C4Ef4902655b445De1Cb2faf4CB40"; //matic
  const oracleInterface = new ethers.utils.Interface(oracleAbi);

  const taskName = "Coingecko oracle";
  const execAddress = oracleAddress;
  const execSelector = oracleInterface.getSighash("updatePrice");
  const offChainResolverHash = "QmaLcH6KdvNgJbrmUVCwAC7TkLenQtzAvt3bfpSMGSneXW";
  const offChainResolverArgs = { oracleAddress };

  const res = await ops.createTask(
    {
      name: taskName,
      execAddress,
      execSelector,
      offChainResolverHash,
      offChainResolverArgs,
    },
    { gasPrice: ethers.utils.parseUnits("100", "gwei") }
  );

  console.log("tx: ", res.tx);
  console.log("taskId: ", res.taskId);
};

main();
