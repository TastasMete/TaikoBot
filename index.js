async function main() {
    let web3Instance = getWeb3();
    const maxIterations = 50;  // Just run for 50 iterations without time limit
    let completedIterations = 0;
    let completedSwaps = 0;
    const wethContractAddress = '0xA51894664A773981C6C112C43ce576f315d5b1B6'; // Correct WETH contract address for Taiko network

    while (completedIterations < maxIterations) {
        const waitTime = getRandomWaitTime(300000); // Random wait up to 5 minutes (300000 ms) for each iteration
        console.log(`Waiting for ${waitTime / 1000} seconds before next iteration.`);
        
        // Wait for the specified time
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        const gasPriceWei = randomGasPrice(web3Instance);
        let localNonce = await getNonce(web3Instance);

        const balanceWei = await web3Instance.eth.getBalance(walletAddress);
        const balance = new BN(balanceWei);
        const gasLimit = new BN(500000); 
        const totalTxCost = gasLimit.mul(gasPriceWei);

        console.log(`Gas Limit: ${gasLimit.toString()}, Gas Price: ${web3Instance.utils.fromWei(gasPriceWei, 'gwei')} Gwei`);
        console.log(`Total Tx Cost: ${web3Instance.utils.fromWei(totalTxCost.toString(), 'ether')} ETH`);

        if (balance.lt(totalTxCost)) {
            console.log("Insufficient funds to cover the transaction cost. Transaction skipped.");
            break;
        }

        // ETH to WETH (Wrap)
        const amountToWrap = balance.muln(90).divn(100); // 90% of the balance
        await waitForEthBalance(web3Instance, walletAddress, amountToWrap.add(totalTxCost)); // Check if the required ETH balance is available

        localNonce = await getNonce(web3Instance);
        let txHash = await executeTransaction(wrap, gasPriceWei, localNonce, web3Instance.utils.fromWei(amountToWrap, 'ether'));
        if (!txHash) break;
        localNonce++;
        let txLink = `https://taikoscan.io/tx/${txHash}`;
        console.log(`Wrap Transaction sent: ${txLink}, \nAmount: ${web3Instance.utils.fromWei(amountToWrap, 'ether')} ETH`);
        completedSwaps++;

        // Wait for wrap transaction to be confirmed
        let confirmed = false;
        while (!confirmed) {
            confirmed = await confirmTransaction(web3Instance, txHash);
            if (!confirmed) {
                console.log("Wrap transaction not confirmed yet. Waiting...");
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before checking again
            }
        }
        console.log("Wrap transaction confirmed.");

        // WETH to ETH (Unwrap)
        const wethBalance = await waitForWethBalance(web3Instance, wethContractAddress, walletAddress);
        console.log(`WETH Balance: ${web3Instance.utils.fromWei(wethBalance, 'ether')} WETH`);

        localNonce = await getNonce(web3Instance);
        txHash = await executeTransaction(unwrap, gasPriceWei, localNonce, web3Instance.utils.fromWei(wethBalance, 'ether'));
        if (!txHash) break;
        localNonce++;
        txLink = `https://taikoscan.io/tx/${txHash}`;
        console.log(`Unwrap Transaction sent: ${txLink}, \nAmount: ${web3Instance.utils.fromWei(wethBalance, 'ether')} WETH`);
        completedSwaps++;

        completedIterations++;
        console.log(`Completed ${completedIterations} iterations and ${completedSwaps} swaps.`);
    }

    console.log(`Completed all ${maxIterations} iterations. Exiting loop.`);
}

main().catch(console.error);
