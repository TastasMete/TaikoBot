require('dotenv').config();
const { web3, walletAddress, switchRpc } = require('./config/web3');
const { lendAmount } = require('./src/module/minterest/lend');
const { redeem } = require('./src/module/minterest/reedem');
const { wrap } = require('./src/module/wrap/wrap');
const { unwrap } = require('./src/module/wrap/unwrap');
const BN = require('bn.js');

function randomGasPrice() {
    const minGwei = new BN(web3.utils.toWei('0.01005', 'gwei'));
    const maxGwei = new BN(web3.utils.toWei('0.013', 'gwei'));
    const randomGwei = minGwei.add(new BN(Math.floor(Math.random() * (maxGwei.sub(minGwei).toNumber()))));
    return randomGwei;
}

function randomIterations() {
    return Math.random() < 0.5 ? 7 : 8; // Randomly choose between 7 or 8
}

async function getNonce(web3Instance) {
    return await web3Instance.eth.getTransactionCount(walletAddress, 'pending');
}

async function executeTransaction(action, gasPriceWei, ...args) {
    let web3Instance = web3;
    let nonce = await getNonce(web3Instance);
    while (true) {
        try {
            const gasLimit = new BN(800000);
            const totalTxCost = gasLimit.mul(new BN(gasPriceWei));
            const balanceWei = await web3Instance.eth.getBalance(walletAddress);
            const balance = new BN(balanceWei);

            if (balance.lt(totalTxCost)) {
                console.log("Insufficient funds to cover the transaction cost. Transaction skipped.");
                return;
            }

            return await action(...args, gasPriceWei.toString(), nonce);
        } catch (error) {
            console.error(`Error executing transaction: ${error.message}`);
            console.log("Retrying...");
            web3Instance = switchRpc(); // Switch to the next RPC URL
            nonce = await getNonce(web3Instance);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
        }
    }
}

async function main() {
    const lendRangeMin = 1.0;
    const lendRangeMax = 2.0;
    const maxIterations = randomIterations();
    let iterationCount = 0;

    while (iterationCount < maxIterations) {
        const gasPriceWei = randomGasPrice();

        const balanceWei = await web3.eth.getBalance(walletAddress);
        const balance = new BN(balanceWei);
        const gasLimit = new BN(800000); // gas limit to 800,000
        const totalTxCost = gasLimit.mul(gasPriceWei);

        console.log(`Gas Limit: ${gasLimit.toString()}, Gas Price: ${web3.utils.fromWei(gasPriceWei, 'gwei')} Gwei`);
        console.log(`Total Tx Cost: ${web3.utils.fromWei(totalTxCost.toString(), 'ether')} ETH`);

        if (balance.lt(totalTxCost)) {
            console.log("Insufficient funds to cover the transaction cost. Transaction skipped.");
            break;
        }

        // Lend
        let amount = Math.random() * (lendRangeMax - lendRangeMin) + lendRangeMin;
        amount = Math.floor(amount * 1_000_000);
        let txHash = await executeTransaction(lendAmount, gasPriceWei, amount);
        if (!txHash) break;
        let txLink = `https://taikoscan.io/tx/${txHash}`;
        let amountDecimal = amount / 1_000_000;
        console.log(`Lend Transaction sent: ${txLink}, \nAmount: ${amountDecimal} USDC \nGwei: ${web3.utils.fromWei(gasPriceWei, 'gwei')} Gwei`);

        // Redeem
        txHash = await executeTransaction(redeem, gasPriceWei);
        if (!txHash) break;
        
        // Wrap
        const wrapAmountMin = 0.0003;
        const wrapAmountMax = 0.0004;
        let wrapAmount = Math.random() * (wrapAmountMax - wrapAmountMin) + wrapAmountMin;
        wrapAmount = parseFloat(wrapAmount.toFixed(6));
        txHash = await executeTransaction(wrap, gasPriceWei, wrapAmount);
        if (!txHash) break;
        txLink = `https://taikoscan.io/tx/${txHash}`;
        console.log(`Wrap Transaction sent: ${txLink}, \nAmount: ${wrapAmount} ETH`);

        // Unwrap
        txHash = await executeTransaction(unwrap, gasPriceWei, wrapAmount);
        if (!txHash) break;
        txLink = `https://taikoscan.io/tx/${txHash}`;
        console.log(`Unwrap Transaction sent: ${txLink}, \nAmount: ${wrapAmount} ETH`);

        iterationCount++;
    }

    console.log(`Completed ${maxIterations} iterations. Exiting loop.`);
}

main().catch(console.error);
