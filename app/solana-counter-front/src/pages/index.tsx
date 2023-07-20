import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ConnectionContext, useAnchorWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program, web3,BN } from '@project-serum/anchor';
import idl from '../idl.json';
import { WalletModalContext } from '@solana/wallet-adapter-react-ui';

const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

const Home: NextPage = () => {

    const {connection} = useContext(ConnectionContext);
    const [ initialize, setInitialize ] = useState(false);
    const [ showCounter, setShowCounter ] = useState(false);
    const [ counterValue, setCounterValue ] = useState(0);
    const [count, setCount] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    useContext(WalletModalContext);
    const wallet= useAnchorWallet();
    const baseAccount = useMemo(() => web3.Keypair.generate(),[]);


    useEffect(() => {
        setInitialize(wallet ? true : false);
    },[wallet]);

    function getProvider() {
        if (!wallet) throw new Error('wallet is null');
        // link to the network
        const provider = new AnchorProvider(connection, wallet, {
            preflightCommitment: 'confirmed',
            commitment: 'confirmed',
        });
        if (!provider) throw new Error('provider is null');
        return provider;
    }

    async function initSolanaRCP(rcpMethod: Function) {
        setError("");
        setLoading(true);
        const provider = getProvider();
        const idlJson =  JSON.stringify(idl);
        const idlObject = JSON.parse(idlJson); 
        const program = new Program(idlObject,idlObject.metadata.address,provider);
        try {
            const account:any =await rcpMethod(program);
            setCounterValue(account.count);
            setCount(account.count);
         }catch(e:any) {
            if(e.errorLogs) {
                setError(JSON.stringify(e.errorLogs[0]))
            } else{
                setError("An error occur while trying to execute the transaction: "+JSON.stringify(e));
            }

            
        }
        setLoading(false);

    }

    async function initializeCounter(program:Program) {

        await program.methods
        .initialize()
        .accounts({
            counter: baseAccount.publicKey,
            owner: program.provider.publicKey,
            systemProgram: web3.SystemProgram.programId,
            })
        .signers([baseAccount])
        .rpc();
        const counter:any= await program.account.counter.fetch(baseAccount.publicKey);
        setShowCounter(true);
        return counter;            

    }

    async function incrementCounter(program:Program)  {

        await program.methods
        .increment()
        .accounts({
            counter: baseAccount.publicKey,
            })
        .rpc();

        return await program.account.counter.fetch(baseAccount.publicKey);

    }

    async function decrementCounter(program:Program)  {

        await program.methods
        .decrement()
        .accounts({
            counter: baseAccount.publicKey,
            })
        .rpc();

        return await program.account.counter.fetch(baseAccount.publicKey);

    }

    async function setCounter(program:Program)  {
        console.log("Counter value: "+counterValue);
        if(counterValue>=255){
            throw("Counter value must be less than 255")
        }else if(counterValue<0){
            throw("Counter value must be greater than 0")
        }
        await program.methods
        .setCounter(counterValue)
        .accounts({
            counter: baseAccount.publicKey,
            })
        .rpc();
            console.log("Counter value: "+counterValue)
        return await program.account.counter.fetch(baseAccount.publicKey);

    }

    return (
        <div >
            <Head>
                <title>Doge Capital Solana Counter</title>
                <meta name="counter" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="bg-indigo-500 flex min-h-screen items-center justify-center relative">

                <div className={(loading? 'animate-pulse':'')+" flex items-center justify-center h-screen px-2"}>
                <div className="bg-white p-8 rounded shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Doge Capital Solana counter <br/>(testnet)</h2>

                    {showCounter && <>
                    <h2 className="text-2xl font-bold mb-4">Counter: {count}</h2>
                    <div className="mt-4 grid grid-cols-2 gap-1">
                        <input className="border p-2 w-full" type="number" 
                        placeholder="Set counter..." value={counterValue} onChange={(event) => setCounterValue(Number(event.target.value))}  />
                        <button className="bg-green-500 text-white py-2 px-4 rounded" 
                        onClick={()=>initSolanaRCP(setCounter)}>Set</button>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-1">
                        <button className="bg-red-500 text-white py-2 px-4 rounded" 
                            onClick={()=>initSolanaRCP(decrementCounter)}>Decrement</button>
                        <button className="bg-green-500 text-white py-2 px-4 rounded" 
                            onClick={()=>initSolanaRCP(incrementCounter)}>Increment</button>
                    </div>
                    {error && <p className="text-red-300 mt-2 max-w-xs">{error}</p>}
                    </>}
                    { initialize && !showCounter && 
                    <button className="bg-green-500 text-white py-2 px-4 rounded"  
                    onClick={()=>initSolanaRCP(initializeCounter)}>Initialize counter</button>}
                    <div className="mt-4 grid grid-cols-2 gap-1">
                    <WalletMultiButtonDynamic />
                    </div>
                </div>
                </div>

            </main>
        </div>
    );
};

export default Home;
