import { ccc } from "@ckb-ccc/ccc";
import { render, signer } from "@ckb-ccc/playground";

function getExplorerTxUrl(txHash: string) {
  const isMainnet = signer.client.addressPrefix === 'ckb';
  const baseUrl = isMainnet ? 'https://explorer.nervos.org' : 'https://testnet.explorer.nervos.org';

  return `${baseUrl}/transaction/${txHash}`
}

async function main() {
  // Define multiple receiver addresses (you can modify these)
  const receiverAddresses = [
    "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqdwjyxfemjrhddyu87z8hw3y02a7st2p6ck60qtc",
    "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqwrsxvecgrxh4jk7xzg4fm5keavsej7hhsulvz2z"
  ];
  
  // Amount to transfer to each address (in CKB)
  const amountPerAddress = "100";
  
  console.log("Transferring to multiple addresses:");
  for (const addr of receiverAddresses) {
    console.log(`- ${addr}`);
  }
  console.log(`Amount per address: ${amountPerAddress} CKB`);
  
  // Parse the receiver scripts from addresses
  const toAddresses = await Promise.all(
    receiverAddresses.map(addr => ccc.Address.fromString(addr, signer.client))
  );
  
  // Create transaction with multiple outputs
  const tx = ccc.Transaction.from({
    outputs: toAddresses.map(({ script }) => ({ 
      lock: script,
      capacity: ccc.fixedPointFrom(amountPerAddress)
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
  await render(tx);
}

main().catch(console.error);