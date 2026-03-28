import * as anchor from "@coral-xyz/anchor";
import { Program,BN } from "@coral-xyz/anchor";
import { Stakeprogram } from "../target/types/stakeprogram";
import {expect} from "chai"

describe("stakeprogram", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.stakeprogram as Program<Stakeprogram>;
  

  it("1.Is initialized! for payer1", async () => {
    // Add your test here.
    const wallet=anchor.getProvider().wallet;
    const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([wallet.payer.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([wallet.payer.publicKey.toBuffer(),Buffer.from("vault")],program.programId)
    const prevuservaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const tx1= await program.methods.initialize().accounts({signer:wallet.payer.publicKey}).signers([]).rpc();
      console.log("Your transaction signature", tx1);
    let accinfo1=await program.account.stakeAcc.fetch(stakeacc);
    const currdur=accinfo1.currtime.toNumber()
    
    const rewards=0+(currdur*0)
     const curruservaultbal=await anchor.getProvider().connection.getBalance(sysvault)
   expect(accinfo1.staker.toBase58()).to.equal(wallet.publicKey.toBase58())
  expect(accinfo1.amount.toNumber()).to.equal(0)
   expect(accinfo1.currtime.toNumber()).to.not.equal(0);
    expect(accinfo1.rewardpts.toNumber()).to.equal(rewards);
    expect(curruservaultbal-prevuservaultbal).to.equal(0)

  
  });

  it("2.Trying to stake for the first time for payer1 with 0 amt",async()=>{
    const payer1=anchor.getProvider().wallet;
    const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([payer1.payer.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([payer1.payer.publicKey.toBuffer(),Buffer.from("vault")],program.programId)
     const prevuservaultbal=await anchor.getProvider().connection.getBalance(sysvault)
     let accinfo1=await program.account.stakeAcc.fetch(stakeacc)
     const initialamt=accinfo1.amount.toNumber()
     const ptime=accinfo1.currtime.toNumber()
     const prevrewards=accinfo1.rewardpts.toNumber()
    try{
      const tx2=await program.methods.stake(new BN(0)).accounts({signer:payer1.payer.publicKey}).signers([]).rpc()

    console.log("Transaction signature for staking by payer1 ",tx2)
    accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    const ctime=accinfo1.currtime.toNumber()
    const rewards=prevrewards+(ctime-ptime)*initialamt
   const curruservaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    expect(accinfo1.staker.toBase58()).to.equal(payer1.publicKey.toBase58())
   expect(accinfo1.amount.toNumber()).to.equal(10000000)
    expect(accinfo1.rewardpts.toNumber()).to.equal(rewards)
    expect(curruservaultbal-prevuservaultbal).to.equal(10000000)
    }
    catch(err){
      expect(err.error.errorCode.code).to.equal("StakeAmountError")
    }
  })

  it("3.Trying to stake for the first time for payer1 with amt 0.01 sol",async()=>{
    const payer1=anchor.getProvider().wallet;
    const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([payer1.payer.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([payer1.payer.publicKey.toBuffer(),Buffer.from("vault")],program.programId)
     const prevuservaultbal=await anchor.getProvider().connection.getBalance(sysvault)
     let accinfo1=await program.account.stakeAcc.fetch(stakeacc)
     const initialamt=accinfo1.amount.toNumber()
     const ptime=accinfo1.currtime.toNumber()
     const prevrewards=accinfo1.rewardpts.toNumber()
    try{
      const tx2=await program.methods.stake(new BN(0.01*anchor.web3.LAMPORTS_PER_SOL)).accounts({signer:payer1.payer.publicKey}).signers([]).rpc()

    console.log("Transaction signature for staking by payer1 ",tx2)
    accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    const ctime=accinfo1.currtime.toNumber()
    const rewards=prevrewards+(ctime-ptime)*initialamt
   const curruservaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    expect(accinfo1.staker.toBase58()).to.equal(payer1.publicKey.toBase58())
   expect(accinfo1.amount.toNumber()).to.equal(10000000)
    expect(accinfo1.rewardpts.toNumber()).to.equal(rewards)
    expect(curruservaultbal-prevuservaultbal).to.equal(10000000)
    }
    catch(err){
      expect(err.error.errorCode.code).to.equal("StakeAmountError")
    }
  })
  it("4.Unstaking of amt by payer1 less than invested",async()=>{
    const payer1=anchor.getProvider().wallet
    const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([payer1.payer.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([payer1.payer.publicKey.toBuffer(),Buffer.from("vault")],program.programId)
    const prevuservaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    let accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    const ptime=accinfo1.currtime.toNumber()
    const initialamt=accinfo1.amount.toNumber()
    const prevrewards=accinfo1.rewardpts.toNumber()
    const tx3=await program.methods.unstake(new BN(100)).accounts({signer:payer1.payer.publicKey}).signers([]).rpc()

    console.log("Transaction signature for Unstaking of amt by payer1 less than invested ",tx3)
    accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    const ctime=accinfo1.currtime.toNumber()
    const rewards=prevrewards+(ctime-ptime)*initialamt
    const curruservaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    expect(accinfo1.amount.toNumber()).to.equal(9999900)
    expect(accinfo1.rewardpts.toNumber()).to.equal(rewards)
    expect(curruservaultbal-prevuservaultbal).to.equal(-100)
  })

  it("5.Unstaking by payer1 more than what is there in vault",async()=>{
    const payer1=anchor.getProvider().wallet;
    const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([payer1.payer.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([payer1.payer.publicKey.toBuffer(),Buffer.from("vault")],program.programId)

    let accinfo=await program.account.stakeAcc.fetch(stakeacc)
    const ptime=accinfo.currtime.toNumber()
    const intialamt=accinfo.amount.toNumber()
    const prevuservaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const prevrewards=accinfo.rewardpts.toNumber()
    
    let tx4;
    try{
      await new Promise(res=>setTimeout(res,2000))
      tx4=await program.methods.unstake(new BN(10000000)).accounts({signer:payer1.payer.publicKey}).signers([]).rpc()

       accinfo=await program.account.stakeAcc.fetch(stakeacc)
    const curruservaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const ctime=accinfo.currtime.toNumber()
    const rewards=prevrewards+(ctime-ptime)*intialamt
    expect(accinfo.amount.toNumber()).to.equal(0)
   expect(curruservaultbal-prevuservaultbal).to.equal(-10000000)
    let dur=ctime-ptime 

    expect(accinfo.rewardpts.toNumber()).to.equal(rewards)
    console.log(tx4)
    }
    catch(err){
      expect(err.error.errorCode.code).to.equal("InsufficientFundError");
    }

   
  })

  it("6.Unstaking by payer1 what is there in vault",async()=>{
    const payer1=anchor.getProvider().wallet;
    const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([payer1.payer.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([payer1.payer.publicKey.toBuffer(),Buffer.from("vault")],program.programId)

    let accinfo=await program.account.stakeAcc.fetch(stakeacc)
    const ptime=accinfo.currtime.toNumber()
    const initialamt=accinfo.amount.toNumber()
    const prevuservaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const prevrewards=accinfo.rewardpts.toNumber()
    await new Promise(res=>setTimeout(res,2000))
    const tx4=await program.methods.unstake(new BN(1000000)).accounts({signer:payer1.payer.publicKey}).signers([]).rpc()

    accinfo=await program.account.stakeAcc.fetch(stakeacc)
    const curruservaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const ctime=accinfo.currtime.toNumber()
    expect(accinfo.amount.toNumber()).to.equal(8999900)
   expect(curruservaultbal-prevuservaultbal).to.equal(-1000000)
    let dur=ctime-ptime 
const rewards=prevrewards+(ctime-ptime)*initialamt
    expect(accinfo.rewardpts.toNumber()).to.equal(rewards)
    console.log(tx4)
  })

  it("7.Staking of amt by payer1",async()=>{
    const payer1=anchor.getProvider().wallet 
    const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([payer1.payer.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([payer1.payer.publicKey.toBuffer(),Buffer.from("vault")],program.programId)
    let accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    const prevuservaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const ptime=accinfo1.currtime.toNumber()
    const initialamt=accinfo1.amount.toNumber()
    const prevrewards=accinfo1.rewardpts.toNumber()
    const tx6=await program.methods.stake(new BN(3000)).accounts({signer:payer1.payer.publicKey}).signers([]).rpc()
    accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    const ctime=accinfo1.currtime.toNumber()
    const rewards=prevrewards+(ctime-ptime)*initialamt
    const curruservaultbal=await anchor.getProvider().connection.getBalance(sysvault)

    expect(accinfo1.amount.toNumber()).to.equal(9002900)
    expect(curruservaultbal-prevuservaultbal).to.equal(3000)
    expect(accinfo1.rewardpts.toNumber()).to.equal(rewards)

  })

  it("8.Staking of amt by payer1",async()=>{
    const payer1=anchor.getProvider().wallet 
    const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([payer1.payer.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([payer1.payer.publicKey.toBuffer(),Buffer.from("vault")],program.programId)
    let accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    const prevuservaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const ptime=accinfo1.currtime.toNumber()
    const initialamt=accinfo1.amount.toNumber()
    const prevrewards=accinfo1.rewardpts.toNumber()
    const tx7=await program.methods.stake(new BN(2000)).accounts({signer:payer1.payer.publicKey}).signers([]).rpc()
    accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    const ctime=accinfo1.currtime.toNumber()
    const rewards=prevrewards+(ctime-ptime)*initialamt
    const curruservaultbal=await anchor.getProvider().connection.getBalance(sysvault)

    expect(accinfo1.amount.toNumber()).to.equal(9004900)
    expect(curruservaultbal-prevuservaultbal).to.equal(2000)
    expect(accinfo1.rewardpts.toNumber()).to.equal(rewards)

  })
   it("9.Claim reward points for payer1",async()=>{
    const payer1=anchor.getProvider().wallet 
    const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([payer1.payer.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([payer1.payer.publicKey.toBuffer(),Buffer.from("vault")],program.programId)
    let accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    const prevuservaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const ptime=accinfo1.currtime.toNumber()
    const initialamt=accinfo1.amount.toNumber()
    const prevrewards=accinfo1.rewardpts.toNumber()
    const tx7=await program.methods.claimreward().accounts({signer:payer1.payer.publicKey}).signers([]).rpc()
    accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    const ctime=accinfo1.currtime.toNumber()
    // const rewards=prevrewards+(ctime-ptime)*initialamt
    const curruservaultbal=await anchor.getProvider().connection.getBalance(sysvault)

    expect(accinfo1.amount.toNumber()).to.equal(9004900)
    expect(curruservaultbal-prevuservaultbal).to.equal(0)
    expect(accinfo1.rewardpts.toNumber()).to.equal(0)

  })
  it("10.Unstaking by payer1 what is there in vault",async()=>{
    const payer1=anchor.getProvider().wallet;
    const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([payer1.payer.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([payer1.payer.publicKey.toBuffer(),Buffer.from("vault")],program.programId)

    let accinfo=await program.account.stakeAcc.fetch(stakeacc)
    const ptime=accinfo.currtime.toNumber()
    const initialamt=accinfo.amount.toNumber()
    const prevuservaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const prevrewards=accinfo.rewardpts.toNumber()
    await new Promise(res=>setTimeout(res,2000))
    const tx4=await program.methods.unstake(new BN(200000)).accounts({signer:payer1.payer.publicKey}).signers([]).rpc()

    accinfo=await program.account.stakeAcc.fetch(stakeacc)
    const curruservaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const ctime=accinfo.currtime.toNumber()
    expect(accinfo.amount.toNumber()).to.equal(8804900)
   expect(curruservaultbal-prevuservaultbal).to.equal(-200000)
    let dur=ctime-ptime 
const rewards=prevrewards+(ctime-ptime)*initialamt
    expect(accinfo.rewardpts.toNumber()).to.equal(rewards)
    console.log(tx4)
  })

});
