import { parseEther } from "viem";
import { Button, message } from "antd";
import { mainnet, sepolia, polygon, hardhat } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { createConfig, http, useReadContract, useWriteContract, useWatchContractEvent } from "wagmi";
import { Hardhat, Polygon, Sepolia, WagmiWeb3ConfigProvider, MetaMask } from '@ant-design/web3-wagmi';
import { Address, NFTCard, ConnectButton, Connector, useAccount, useProvider } from "@ant-design/web3";
import { WalletNotSelectedError } from "@solana/wallet-adapter-react";

const config = createConfig({
    chains: [mainnet, sepolia, polygon, hardhat],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        [polygon.id]: http(),
        [hardhat.id]: http("http://127.0.0.1:8545/"),
    },
    connectors: [
        injected({
            target: "metaMask",
        }),
    ]
});

const contractInfo = [
    {
        id:1,
        name: "Ethereum",
        contractAddress: "0xEcd0D12E21805803f70de03B72B1C162dB0898d9"
    },
    {
        id:5,
        name: "Sepolia",
        contractAddress: "0x2265013361f64190ccd8dbc2515eae139a52c1b8"
    },
    {
        id:137,
        name: "Polygon",
        contractAddress: "0x418325c3979b7f8a17678ec2463a74355bdbe72c"
    },
    {
        id:31337,
        name: "Hardhat",
        contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    }
]

const CallTest = () => {
  const { account } = useAccount();
  const { chain } = useProvider();
  const result = useReadContract({
    abi: [
      {
        type: 'function',
        name: 'balanceOf',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ type: 'uint256' }],
      },
    ],
    address: contractInfo.find((item) => item.id === chain?.id)?.contractAddress as `0x${string}`,
    functionName: 'balanceOf',
    args: [account?.address as `0x${string}`],
  });


  const { writeContract } = useWriteContract();

  useWatchContractEvent({
    address: contractInfo.find((item) => item.id === chain?.id)?.contractAddress as `0x${string}`,
    abi: [
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "address",
            name: "minter",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "Minted",
        type: "event",
      },
    ],
    eventName: "Minted",
    onLogs() {
      message.success("new minted!");
    },
  });
  
  return (
    <div>
      {result.data?.toString()}
      <Button
        onClick={() => {
          writeContract(
            {
              abi: [
                {
                  type: "function",
                  name: "mint",
                  stateMutability: "payable",
                  inputs: [
                    {
                      internalType: "uint256",
                      name: "quantity",
                      type: "uint256",
                    },
                  ],
                  outputs: [],
                },
              ],
              address: contractInfo.find((item) => item.id === chain?.id)?.contractAddress as `0x${string}`,
              functionName: "mint",
              args: [BigInt(1)],
              value: parseEther("0.01"),
            },
            {
              onSuccess: () => {
                message.success("Mint Success");
              },
              onError: (err) => {
                message.error(err.message);
              },
            }
          );
        }}
      >
        mint
      </Button>
    </div>
  );
};

export default function Web3() {
  return (
    <WagmiWeb3ConfigProvider
        config={config}
        chains={[Sepolia, Polygon, Hardhat]}
        wallets={[MetaMask()]}
        eip6963={{
            autoAddInjectedWallets: true,   // EIP6963 auto add injected wallets
        }}
    >
    <Address format address="0xEcd0D12E21805803f70de03B72B1C162dB0898d9" />
      <NFTCard
        address="0xEcd0D12E21805803f70de03B72B1C162dB0898d9"
        tokenId={641}
      /> 
      <Connector>
        <ConnectButton />
      </Connector>
      <CallTest />
    </WagmiWeb3ConfigProvider>
  );
}