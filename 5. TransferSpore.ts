import { ccc } from "@ckb-ccc/ccc";
import { render, signer } from "@ckb-ccc/playground";

function getExplorerTxUrl(txHash: string) {
  const isMainnet = signer.client.addressPrefix === "ckb";
  const baseUrl = isMainnet
    ? "https://explorer.nervos.org"
    : "https://testnet.explorer.nervos.org";

  return `${baseUrl}/transaction/${txHash}`;
}

// The receiver is the signer itself on mainnet
const receiver =
  signer.client.addressPrefix === "ckb"
    ? await signer.getRecommendedAddress()
    : "ckt1qrfrwcdnvssswdwpn3s9v8fp87emat306ctjwsm3nmlkjg8qyza2cqgqq8tfmtd3hl2gj0haq54t24kgwtdpz5ffzukkny82";
console.log(receiver);

const { script: to } = await ccc.Address.fromString(receiver, signer.client);

// Replace with your spore id
const sporeId =
  "0x39b78c12f632742d53fb009a4c9b25fbcf8ea0891fea1a180eeac97299ab158f";

// Build transaction
const { tx } = await ccc.spore.transferSpore({
  signer,
  id: sporeId,
  to,
});
await render(tx);

// Complete missing parts: Pay fee
await tx.completeFeeBy(signer, 1000);
await render(tx);

// Send transaction
const txHash = await signer.sendTransaction(tx);
console.log("Transaction sent:", getExplorerTxUrl(txHash));
await signer.client.waitTransaction(txHash);
// https://testnet.explorer.nervos.org/transaction/0x8ab5a1e5d6bec881b4535ae02b0c39f7adabb1970dffb18e7b5aa16f9a89a289
console.log("Transaction committed:", getExplorerTxUrl(txHash));
await render(tx);