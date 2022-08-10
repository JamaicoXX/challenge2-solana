// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");
// Use this block to generate secret key
// const newPair = Keypair.generate();
// console.log(newPair);

const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        153, 180,  77,  82, 220,  38, 244, 224, 174, 222,  42,
        103, 188, 208, 195,  42, 219, 237, 151, 155, 109, 123,
         71, 124,  31, 210, 126, 131, 144, 228,  90,  87, 175,
          5, 165,  31,  94, 182, 110, 107, 219, 189,  92, 149,
        178, 163, 109,  92, 159, 187, 212,  31, 153,  77,  39,
        231,  51, 156,  84, 254, 160, 124, 195, 134
      ]           
);

const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);
    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();
   
    //Get from Wallet Current Balance
    var fromWalletBalance = await connection.getBalance(
        new PublicKey(from.publicKey)
    ); 
    console.log(`Senders Wallet balance: ${parseInt(fromWalletBalance) / LAMPORTS_PER_SOL} SOL`);
   
    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    //Get from Wallet Current Balance
    fromWalletBalance = await connection.getBalance(
        new PublicKey(from.publicKey)
    ); 
    console.log(`Senders Wallet balance: ${parseInt(fromWalletBalance) / LAMPORTS_PER_SOL} SOL`);
    //Compute 50% of From wallet Balance
    var halfFromWalletBal = fromWalletBalance / 2;
    //Get To Wallet Current Balance
    var toWalletBalance = await connection.getBalance(
        new PublicKey(to.publicKey)
    ); 
    console.log(`Receivers Wallet balance: ${parseInt(toWalletBalance) / LAMPORTS_PER_SOL} SOL`);
    //Display To Wallet Current Balance
    console.log(`Half of Senders Wallet Balance is: ${(halfFromWalletBal / LAMPORTS_PER_SOL)} SOL`);
    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            //lamports: LAMPORTS_PER_SOL / 100
            lamports: halfFromWalletBal
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is ', signature);
    //Get From Wallet Current Balance
    fromWalletBalance = await connection.getBalance(
        new PublicKey(from.publicKey)
    ); 
    console.log(`Sender Wallet balance: ${parseInt(fromWalletBalance) / LAMPORTS_PER_SOL} SOL`);
    //Get To Wallet Current Balance
    toWalletBalance = await connection.getBalance(
        new PublicKey(to.publicKey)
    );
    console.log(`Receivers Wallet balance: ${parseInt(fromWalletBalance) / LAMPORTS_PER_SOL} SOL`); 
}

transferSol();