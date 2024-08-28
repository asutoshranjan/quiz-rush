import { useState } from "react";
import { PublicKey, SystemProgram, Transaction, Connection } from '@solana/web3.js';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

export default function TransactionButtons() {

      // for sending txn
  const [txSignature, setTxSignature] = useState("");
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [isTransactionSuccessful, setIsTransactionSuccessful] = useState<boolean | null>(null);


  async function makePayment() {
    try {
        if (!publicKey) throw new Error('Wallet not connected');

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new PublicKey('8CfExqnCKsnkfkcwnm2ErSMc7jZJ6KBGXtjrpyqHgujg'),
                lamports: 10000000, // 0.01 SOL
            })
        );

        const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        const signature = await sendTransaction(transaction, connection, { minContextSlot });
        setTxSignature(signature);

        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });

    } catch (error) {
        console.error('Transaction Error:', error);
    }
}


const checkTxn = async() => {

    console.log('Checking..... Txn:', txSignature);

    const signature = txSignature;

    const latestBlockHash = await connection.getLatestBlockhash();
   
    try {
      const result  =  await connection.confirmTransaction(
        {
           blockhash: latestBlockHash.blockhash,
           lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
           signature,
        },
     );
      console.log(result);
      setIsTransactionSuccessful(true);

    } catch (error) {
        console.error('Confirmation Error:', error);
        setIsTransactionSuccessful(false);
    }

}

    return (
        <div>
            <button onClick={makePayment} className='bg-light-blue text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition duration-300 px-4'>Send 0.1 SOL {`${txSignature}`} {`${isTransactionSuccessful}`}</button>
            <button onClick={checkTxn} className='bg-light-blue text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition duration-300 px-4'>Check Txn {`${isTransactionSuccessful}`}</button>
        </div>
    );
}