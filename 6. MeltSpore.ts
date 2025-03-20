import { ccc } from "@ckb-ccc/ccc";
import { render, signer } from "@ckb-ccc/playground";

function getExplorerTxUrl(txHash: string) {
  const isMainnet = signer.client.addressPrefix === "ckb";
  const baseUrl = isMainnet
    ? "https://explorer.nervos.org"
    : "https://testnet.explorer.nervos.org";

  return `${baseUrl}/transaction/${txHash}`;
}

// Replace with your spore id
const sporeId =
  "0x949c8c2182d6b44c134fe8aaa6e5a7a9701b1bb3bd6d04687ac8575331ca65db";

// Build transaction
const { tx } = await ccc.spore.meltSpore({
  signer,
  id: sporeId,
});
await render(tx);

// Complete missing parts: Pay fee
await tx.completeFeeBy(signer, 1000);
await render(tx);

// Send transaction
const txHash = await signer.sendTransaction(tx);
console.log("Transaction sent:", getExplorerTxUrl(txHash));
await signer.client.waitTransaction(txHash);
// https://testnet.explorer.nervos.org/transaction/0x0362d2ddf2cfe0ffbb3615ab64ae8b6dbd8f60c8c3455dc386c611b1b4bc39de
console.log("Transaction committed:", getExplorerTxUrl(txHash));
await render(tx);