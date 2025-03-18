import { ccc } from "@ckb-ccc/ccc";
import { render, signer } from "@ckb-ccc/playground";

function getExplorerTxUrl(txHash: string) {
  const isMainnet = signer.client.addressPrefix === 'ckb';
  const baseUrl = isMainnet ? 'https://explorer.nervos.org' : 'https://testnet.explorer.nervos.org';

  return `${baseUrl}/transaction/${txHash}`
}

async function main() {
  // Define receivers with their addresses and amounts
  // Each entry contains an address and the amount to send (in CKB)
  const receivers = [
    {
      address: "ckt1qrejnmlar3r452tcg57gvq8patctcgy8acync0hxfnyka35ywafvkqgj2pf355d92nhpmcvqdu7n7vf5t5a4vg74qqz3xcyg",
      amount: "1111"
    },
    {
      address: "ckt1qrejnmlar3r452tcg57gvq8patctcgy8acync0hxfnyka35ywafvkqgj69xmyjmq0usk4h9qqkcd4cz2f2ehwahxqq2v639c",
      amount: "2222"
    },
    {
      address: "ckt1qrejnmlar3r452tcg57gvq8patctcgy8acync0hxfnyka35ywafvkqgjzlcruwuqu9u9nm2x7dgtpw7c6mhqlexxqq4fyd2z",
      amount: "3333"
    },
    {
      address: "ckt1qrejnmlar3r452tcg57gvq8patctcgy8acync0hxfnyka35ywafvkqgjelvtdm8dqnwtfka0vngpdf2jnymeg0u2qqp85rka",
      amount: "4444"
    },
    {
      address: "ckt1qrejnmlar3r452tcg57gvq8patctcgy8acync0hxfnyka35ywafvkqgjmpqjeqqvpykt97xlvpm58ylcw2d84mgsqqxpt4d5",
      amount: "5555"
    },
    {
      address: "ckt1qrejnmlar3r452tcg57gvq8patctcgy8acync0hxfnyka35ywafvkqgy2qwh9zm9mxl5wpzdqgzqv6dwrs3xvkyqqqz9ujzl",
      amount: "6666"
    },
    {
      address: "ckt1qrejnmlar3r452tcg57gvq8patctcgy8acync0hxfnyka35ywafvkqgjtv3gljmq490huay7qrzt3q25lst7wpkaqqccppvh",
      amount: "7777"
    },
    {
      address: "ckt1qrejnmlar3r452tcg57gvq8patctcgy8acync0hxfnyka35ywafvkqgj69xmyjmq0usk4h9qqkcd4cz2f2ehwahxqq2v639c",
      amount: "8888"
    },
  ];
  
  
  console.log("Transferring to multiple addresses with different amounts:");
  for (const receiver of receivers) {
    console.log(`- ${receiver.address}: ${receiver.amount} CKB`);
  }
  
  // Parse the receiver scripts from addresses
  const parsedReceivers = await Promise.all(
    receivers.map(async (receiver) => ({
      script: (await ccc.Address.fromString(receiver.address, signer.client)).script,
      amount: receiver.amount
    }))
  );
  
  // Create transaction with multiple outputs
  const tx = ccc.Transaction.from({
    outputs: parsedReceivers.map(({ script, amount }) => ({ 
      lock: script,
      capacity: ccc.fixedPointFrom(amount)
    }))
  });
  
  // Render the initial transaction
  await render(tx);
  
  // Complete missing parts: Fill inputs
  await tx.completeInputsByCapacity(signer);
  await render(tx);
  
  // Complete missing parts: Pay fee
  await tx.completeFeeBy(signer, 2000);
  await render(tx);
  
  // Sign and send the transaction
  console.log("Sending transaction...");
  const txHash = await signer.sendTransaction(tx);
  console.log("Transaction sent:", getExplorerTxUrl(txHash));
  
  // Wait for the transaction to be committed
  console.log("Waiting for transaction to be committed...");
  await signer.client.waitTransaction(txHash);
  console.log("Transaction committed:", getExplorerTxUrl(txHash));
}

main().catch(console.error);