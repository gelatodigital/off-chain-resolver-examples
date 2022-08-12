import "dotenv/config";
import { PolywrapClient } from "@polywrap/client-js";
import { ethereumPlugin } from "@polywrap/ethereum-plugin-js";
import { dateTimePlugin } from "polywrap-datetime-plugin";

const env = process.env;

const getPolywrapClient = (): PolywrapClient => {
  const chain = env.CHAIN ?? "testnet";
  const provider = env.RPC_URL!;

  const polywrapClient = new PolywrapClient({
    plugins: [
      {
        uri: "ens/ethereum.polywrap.eth",
        plugin: ethereumPlugin({
          networks: {
            [chain]: { provider },
          },
          defaultNetwork: chain,
        }),
      },
      {
        uri: "ens/datetime.polywrap.eth",
        plugin: dateTimePlugin({}),
      },
    ],
  });

  return polywrapClient;
};

const polywrapClient = getPolywrapClient();

export default polywrapClient;
