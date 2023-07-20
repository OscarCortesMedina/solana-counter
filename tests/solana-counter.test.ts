import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SystemProgram } from "@solana/web3.js";
import { SolanaCounter } from "../target/types/solana_counter";
import { assert } from "chai";

describe("solana-counter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);
  const program = anchor.workspace.SolanaCounter as Program<SolanaCounter>;
  // Generate a new wallet keypair
  const account = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    await program.methods
      .initialize()
      .accounts({
        counter: account.publicKey,
        owner: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([account])
      .rpc();

    const counterAccount = await program.account.counter.fetch(
      account.publicKey
    );
    assert.equal(counterAccount.count.toString(), new anchor.BN(0).toString());
  });

  it("Is increased!", async () => {
    await program.methods
      .increment()
      .accounts({
        counter: account.publicKey,
      })
      .rpc();

    const counterAccount = await program.account.counter.fetch(
      account.publicKey
    );
    assert.equal(counterAccount.count.toString(), new anchor.BN(1).toString());
  });

  it("Is decreased!", async () => {
    await program.methods
      .decrement()
      .accounts({
        counter: account.publicKey,
      })
      .rpc();

    const counterAccount = await program.account.counter.fetch(
      account.publicKey
    );
    assert.equal(counterAccount.count.toString(), new anchor.BN(0).toString());
  });

  it("Is set!", async () => {
    await program.methods
      .setCounter(69)
      .accounts({
        counter: account.publicKey,
      })
      .rpc();

    const counterAccount = await program.account.counter.fetch(
      account.publicKey
    );
    assert.equal(counterAccount.count.toString(), new anchor.BN(69).toString());
  });
});
