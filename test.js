//fill in your mnemonic and use this as follows:
//node test.js
const ethers = require('ethers');
let mnemonic = "";
let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
console.log(mnemonicWallet.privateKey);
