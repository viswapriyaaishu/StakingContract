import * as anchor from "@coral-xyz/anchor";
import { Program,BN } from "@coral-xyz/anchor";
import { Stakeprogram } from "../target/types/stakeprogram";
import {expect} from "chai"

describe("1.global vault init",()=>{
  it("1.1 Global vault init by admin",async()=>{
    anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.stakeprogram as Program<Stakeprogram>;
    const admin=anchor.getProvider().wallet 
    const [vaultacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault")],program.programId)

 const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vaultaccount")],program.programId)

    // const prevvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
   
  const tx1=await program.methods.initializevault().accounts({admin:admin.payer.publicKey}).signers([]).rpc()
 const currvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
const accinfo1=await program.account.globalVault.fetch(vaultacc)


expect(accinfo1.funds.toNumber()).to.equal(0)
expect(currvaultbal).to.equal(0)

  })
})

describe("stakeprogram", async() => {
  const TOKEN_2022_PROGRAM_ID = new anchor.web3.PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
const ASSOCIATED_TOKEN_PROGRAM_ID = new anchor.web3.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const precision=100000000
  const rate=1
  const program = anchor.workspace.stakeprogram as Program<Stakeprogram>;
  const admin=anchor.getProvider().wallet.payer.publicKey
  const user1=anchor.web3.Keypair.generate()
  const user2=anchor.web3.Keypair.generate()
  const user3=anchor.web3.Keypair.generate()

  const arrofusers=[user1,user2,user3]

  it("Checking the 3 sol being transferred to 3 users",async()=>{
    for(let i=0;i<arrofusers.length;i++){
    const tx=new anchor.web3.Transaction().add(anchor.web3.SystemProgram.transfer({
      fromPubkey:admin,
      toPubkey:arrofusers[i].publicKey,
      lamports:3*anchor.web3.LAMPORTS_PER_SOL
    }))

    await anchor.getProvider().sendAndConfirm(tx)
  }
  let user1bal=await anchor.getProvider().connection.getBalance(user1.publicKey)
   let user2bal=await anchor.getProvider().connection.getBalance(user2.publicKey)
    let user3bal=await anchor.getProvider().connection.getBalance(user3.publicKey)
   
    expect(user1bal).to.equal(3*anchor.web3.LAMPORTS_PER_SOL)
  expect(user2bal).to.equal(3*anchor.web3.LAMPORTS_PER_SOL)
  expect(user3bal).to.equal(3*anchor.web3.LAMPORTS_PER_SOL)
 
})

  it("1.Is initialized! for user11", async () => {
    // Add your test here.
    const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([user1.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vaultaccount")],program.programId)
     const [vaultacc,bump3]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault")],program.programId)
     let[mint,bump4]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("mint")],program.programId)
    const prevvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const tx1= await program.methods.initializestakeacc().accounts({signer:user1.publicKey}).signers([user1]).rpc();
      console.log("Your transaction signature", tx1);
    let accinfo1=await program.account.stakeAcc.fetch(stakeacc);
    const currdur=accinfo1.currtime.toNumber()
    let accinfo2=await program.account.globalVault.fetch(vaultacc)
    const rewards=0+Math.floor((currdur*0*rate)/precision)
     const currvaultbal=await anchor.getProvider().connection.getBalance(sysvault)

      
     let [user1ata]=anchor.web3.PublicKey.findProgramAddressSync([user1.publicKey.toBuffer(),TOKEN_2022_PROGRAM_ID.toBuffer(),mint.toBuffer()],ASSOCIATED_TOKEN_PROGRAM_ID)

     const user1atabal=await anchor.getProvider().connection.getTokenAccountBalance(user1ata)

   expect(accinfo1.staker.toBase58()).to.equal(user1.publicKey.toBase58())
  expect(accinfo1.amount.toNumber()).to.equal(0)
   expect(accinfo1.currtime.toNumber()).to.not.equal(0);
    expect(accinfo1.rewardpts.toNumber()).to.equal(rewards);
    expect(accinfo2.funds.toNumber()).equal(0)
    expect(currvaultbal-prevvaultbal).to.equal(0)
     expect(Number(user1atabal.value.amount)).to.equal(0)

  
  });
  it("2.Is initialized! for user2", async () => {
    const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([user2.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vaultaccount")],program.programId)
     const [vaultacc,bump3]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault")],program.programId)
     let[mint,bump4]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("mint")],program.programId)
    const prevvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const tx1= await program.methods.initializestakeacc().accounts({signer:user2.publicKey}).signers([user2]).rpc();
      console.log("Your transaction signature", tx1);
    let accinfo1=await program.account.stakeAcc.fetch(stakeacc);
    const currdur=accinfo1.currtime.toNumber()
    let accinfo2=await program.account.globalVault.fetch(vaultacc)
    const rewards=0+(currdur*0)
     const currvaultbal=await anchor.getProvider().connection.getBalance(sysvault)

      
      let [user2ata]=anchor.web3.PublicKey.findProgramAddressSync([user2.publicKey.toBuffer(),TOKEN_2022_PROGRAM_ID.toBuffer(),mint.toBuffer()],ASSOCIATED_TOKEN_PROGRAM_ID)
      const user2atabal=await anchor.getProvider().connection.getTokenAccountBalance(user2ata)

   expect(accinfo1.staker.toBase58()).to.equal(user2.publicKey.toBase58())
  expect(accinfo1.amount.toNumber()).to.equal(0)
   expect(accinfo1.currtime.toNumber()).to.not.equal(0);
    expect(accinfo1.rewardpts.toNumber()).to.equal(rewards);
    expect(accinfo2.funds.toNumber()).equal(0)
    expect(currvaultbal-prevvaultbal).to.equal(0)
    expect(Number(user2atabal.value.amount)).to.equal(0)

  
  });
  it("3.Is initialized! for user3", async () => {
    const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([user3.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vaultaccount")],program.programId)
     const [vaultacc,bump3]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault")],program.programId)
      let[mint,bump4]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("mint")],program.programId)
    const prevvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const tx1= await program.methods.initializestakeacc().accounts({signer:user3.publicKey}).signers([user3]).rpc();
      console.log("Your transaction signature", tx1);
    let accinfo1=await program.account.stakeAcc.fetch(stakeacc);
    const currdur=accinfo1.currtime.toNumber()
    let accinfo2=await program.account.globalVault.fetch(vaultacc)
    const rewards=0+(currdur*0)
     const currvaultbal=await anchor.getProvider().connection.getBalance(sysvault)

     
      let [user3ata]=anchor.web3.PublicKey.findProgramAddressSync([user3.publicKey.toBuffer(),TOKEN_2022_PROGRAM_ID.toBuffer(),mint.toBuffer()],ASSOCIATED_TOKEN_PROGRAM_ID)
      const user3atabal=await anchor.getProvider().connection.getTokenAccountBalance(user3ata)

   expect(accinfo1.staker.toBase58()).to.equal(user3.publicKey.toBase58())
  expect(accinfo1.amount.toNumber()).to.equal(0)
   expect(accinfo1.currtime.toNumber()).to.not.equal(0);
    expect(accinfo1.rewardpts.toNumber()).to.equal(rewards);
    expect(accinfo2.funds.toNumber()).equal(0)
    expect(currvaultbal-prevvaultbal).to.equal(0)
    expect(Number(user3atabal.value.amount)).to.equal(0)
  
  });

  it("4.Trying to stake for the first time by user1 with 0 amt",async()=>{
    const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([user1.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vaultaccount")],program.programId)
     const [vaultacc,bump3]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault")],program.programId)
     const prevvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
     let accinfo1=await program.account.stakeAcc.fetch(stakeacc)
     let accinfo2=await program.account.globalVault.fetch(vaultacc)
     const prevfund=accinfo2.funds.toNumber()
     const initialamt=accinfo1.amount.toNumber()
     const ptime=accinfo1.currtime.toNumber()
     const prevrewards=accinfo1.rewardpts.toNumber()
    try{
      const tx2=await program.methods.stake(new BN(0)).accounts({signer:user1.publicKey}).signers([user1]).rpc()

    console.log("Transaction signature for staking by payer1 ",tx2)
    accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    accinfo2=await program.account.globalVault.fetch(vaultacc)
    const ctime=accinfo1.currtime.toNumber()
    const rewards=prevrewards+Math.floor(((ctime-ptime)*initialamt*rate)/precision)
   const currvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    expect(accinfo1.staker.toBase58()).to.equal(user1.publicKey.toBase58())
   expect(accinfo1.amount.toNumber()).to.equal(initialamt+0)
    expect(accinfo1.rewardpts.toNumber()).to.equal(rewards)
    expect(accinfo2.funds.toNumber()).to.equal(prevfund+0)
    expect(currvaultbal-prevvaultbal).to.equal(10000000)
    }
    catch(err){
      expect(err.error.errorCode.code).to.equal("StakeAmountError")
    }
  })

  it("5.Trying to stake by user1 with amt 0.01 sol",async()=>{
   const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([user1.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vaultaccount")],program.programId)
     const [vaultacc,bump3]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault")],program.programId)
     const prevvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
     let accinfo1=await program.account.stakeAcc.fetch(stakeacc)
     let accinfo2=await program.account.globalVault.fetch(vaultacc)
     const prevfund=accinfo2.funds.toNumber()
     const initialamt=accinfo1.amount.toNumber()
     const ptime=accinfo1.currtime.toNumber()
     const prevrewards=accinfo1.rewardpts.toNumber()
    try{
      const tx2=await program.methods.stake(new BN(0.01*anchor.web3.LAMPORTS_PER_SOL)).accounts({signer:user1.publicKey}).signers([user1]).rpc()

    console.log("Transaction signature for staking by payer1 ",tx2)
    accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    accinfo2=await program.account.globalVault.fetch(vaultacc)
    const ctime=accinfo1.currtime.toNumber()
    const rewards=prevrewards+Math.floor(((ctime-ptime)*initialamt*rate)/precision)
   const currvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    expect(accinfo1.staker.toBase58()).to.equal(user1.publicKey.toBase58())
   expect(accinfo1.amount.toNumber()).to.equal(initialamt+10000000)
    expect(accinfo1.rewardpts.toNumber()).to.equal(rewards)
    expect(currvaultbal-prevvaultbal).to.equal(10000000)
    expect(accinfo2.funds.toNumber()).to.equal(prevfund+10000000)
    }
    catch(err){
      expect(err.error.errorCode.code).to.equal("StakeAmountError")
    }
  })

  it("6.Trying to stake by user2 with amt 0.02 sol",async()=>{
   const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([user2.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vaultaccount")],program.programId)
     const [vaultacc,bump3]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault")],program.programId)
     const prevvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
     let accinfo1=await program.account.stakeAcc.fetch(stakeacc)
     let accinfo2=await program.account.globalVault.fetch(vaultacc)
     const prevfund=accinfo2.funds.toNumber()
     const initialamt=accinfo1.amount.toNumber()
     const ptime=accinfo1.currtime.toNumber()
     const prevrewards=accinfo1.rewardpts.toNumber()
    try{
      const tx2=await program.methods.stake(new BN(0.02*anchor.web3.LAMPORTS_PER_SOL)).accounts({signer:user2.publicKey}).signers([user2]).rpc()

    console.log("Transaction signature for staking by payer1 ",tx2)
    accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    accinfo2=await program.account.globalVault.fetch(vaultacc)
    const ctime=accinfo1.currtime.toNumber()
    const rewards=prevrewards+Math.floor(((ctime-ptime)*initialamt*rate)/precision)
   const currvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    expect(accinfo1.staker.toBase58()).to.equal(user2.publicKey.toBase58())
   expect(accinfo1.amount.toNumber()).to.equal(initialamt+20000000)
    expect(accinfo1.rewardpts.toNumber()).to.equal(rewards)
    expect(currvaultbal-prevvaultbal).to.equal(20000000)
    expect(accinfo2.funds.toNumber()).to.equal(prevfund+20000000)
    }
    catch(err){
      expect(err.error.errorCode.code).to.equal("StakeAmountError")
    }
  })
  it("7.Unstaking of amt by payer1 less than invested",async()=>{
    const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([user1.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vaultaccount")],program.programId)
     const [vaultacc,bump3]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault")],program.programId)
    const prevvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    let accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    let accinfo2=await program.account.globalVault.fetch(vaultacc)
    const prevfund=accinfo2.funds.toNumber()
    const ptime=accinfo1.currtime.toNumber()
    const initialamt=accinfo1.amount.toNumber()
    const prevrewards=accinfo1.rewardpts.toNumber()
    const tx3=await program.methods.unstake(new BN(100)).accounts({signer:user1.publicKey}).signers([user1]).rpc()

    console.log("Transaction signature for Unstaking of amt by payer1 less than invested ",tx3)
    accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    accinfo2=await program.account.globalVault.fetch(vaultacc)
    const ctime=accinfo1.currtime.toNumber()
    const rewards=prevrewards+Math.floor(((ctime-ptime)*initialamt*rate)/precision)
    const currvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
     expect(accinfo1.staker.toBase58()).to.equal(user1.publicKey.toBase58())
    expect(accinfo1.amount.toNumber()).to.equal(initialamt-100)
    expect(accinfo1.rewardpts.toNumber()).to.equal(rewards)
    expect(currvaultbal-prevvaultbal).to.equal(-100)
    expect(accinfo2.funds.toNumber()).to.equal(prevfund-100)
  })
  it("8.Trying to stake by user3 with amt 0.05 sol",async()=>{
   const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([user3.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vaultaccount")],program.programId)
     const [vaultacc,bump3]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault")],program.programId)
     const prevvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
     let accinfo1=await program.account.stakeAcc.fetch(stakeacc)
     let accinfo2=await program.account.globalVault.fetch(vaultacc)
     const prevfund=accinfo2.funds.toNumber()
     const initialamt=accinfo1.amount.toNumber()
     const ptime=accinfo1.currtime.toNumber()
     const prevrewards=accinfo1.rewardpts.toNumber()
    try{
      const tx2=await program.methods.stake(new BN(0.05*anchor.web3.LAMPORTS_PER_SOL)).accounts({signer:user3.publicKey}).signers([user3]).rpc()

    console.log("Transaction signature for staking by payer1 ",tx2)
    accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    accinfo2=await program.account.globalVault.fetch(vaultacc)
    const ctime=accinfo1.currtime.toNumber()
    const rewards=prevrewards+Math.floor(((ctime-ptime)*initialamt*rate)/precision)
   const currvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    expect(accinfo1.staker.toBase58()).to.equal(user3.publicKey.toBase58())
   expect(accinfo1.amount.toNumber()).to.equal(initialamt+50000000)
    expect(accinfo1.rewardpts.toNumber()).to.equal(rewards)
    expect(currvaultbal-prevvaultbal).to.equal(50000000)
    expect(accinfo2.funds.toNumber()).to.equal(prevfund+50000000)
    }
    catch(err){
      expect(err.error.errorCode.code).to.equal("StakeAmountError")
    }
  })
  it("9.Unstaking by user1 more than what he staked",async()=>{
    const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([user1.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vaultaccount")],program.programId)

     const [vaultacc,bump3]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault")],program.programId)

    let accinfo=await program.account.stakeAcc.fetch(stakeacc)
    let accinfo1=await program.account.globalVault.fetch(vaultacc)
    const prevfund=accinfo1.funds.toNumber()
    const ptime=accinfo.currtime.toNumber()
    const initialamt=accinfo.amount.toNumber()
    const prevvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const prevrewards=accinfo.rewardpts.toNumber()
    
    let tx4;
    try{
      await new Promise(res=>setTimeout(res,2000))
      tx4=await program.methods.unstake(new BN(20000000)).accounts({signer:user1.publicKey}).signers([user1]).rpc()

       accinfo=await program.account.stakeAcc.fetch(stakeacc)
       accinfo1=await program.account.globalVault.fetch(vaultacc)
    const currvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const ctime=accinfo.currtime.toNumber()
    const rewards=prevrewards+Math.floor(((ctime-ptime)*initialamt*rate)/precision)
    expect(accinfo.staker.toBase58()).to.equal(user1.publicKey.toBase58())
    expect(accinfo.amount.toNumber()).to.equal(initialamt-20000000)
   expect(currvaultbal-prevvaultbal).to.equal(-20000000)
    let dur=ctime-ptime 

    expect(accinfo.rewardpts.toNumber()).to.equal(rewards)
    expect(accinfo1.funds.toNumber()).to.equal(prevfund-20000000)
    }
    catch(err){
      expect(err.error.errorCode.code).to.equal("UnStakeAmountError");
    }

   
  })

   it("10.Unstaking by user2 of 0.01 sol from vault",async()=>{
    const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([user2.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vaultaccount")],program.programId)

     const [vaultacc,bump3]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault")],program.programId)

    let accinfo=await program.account.stakeAcc.fetch(stakeacc)
    let accinfo1=await program.account.globalVault.fetch(vaultacc)
    const prevfund=accinfo1.funds.toNumber()
    const ptime=accinfo.currtime.toNumber()
    const initialamt=accinfo.amount.toNumber()
    const prevvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const prevrewards=accinfo.rewardpts.toNumber()
    
    let tx4;
    try{
      await new Promise(res=>setTimeout(res,2000))
      tx4=await program.methods.unstake(new BN(10000000)).accounts({signer:user2.publicKey}).signers([user2]).rpc()

       accinfo=await program.account.stakeAcc.fetch(stakeacc)
       accinfo1=await program.account.globalVault.fetch(vaultacc)
    const currvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const ctime=accinfo.currtime.toNumber()
    const rewards=prevrewards+Math.floor(((ctime-ptime)*initialamt*rate)/precision)
    expect(accinfo.amount.toNumber()).to.equal(initialamt-10000000)
   expect(currvaultbal-prevvaultbal).to.equal(-10000000)
    let dur=ctime-ptime 

    expect(accinfo.rewardpts.toNumber()).to.equal(rewards)
    expect(accinfo1.funds.toNumber()).to.equal(prevfund-10000000)
    }
    catch(err){
      console.log(err)
      // expect(err.error.errorCode.code).to.equal("UnStakeAmountError");
    }

   
  })

  it("11.Unstaking by user1 what he staked",async()=>{
   const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([user1.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vaultaccount")],program.programId)
     const [vaultacc,bump3]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault")],program.programId)

    let accinfo=await program.account.stakeAcc.fetch(stakeacc)
    let accinfo1=await program.account.globalVault.fetch(vaultacc)
    const prevfund=accinfo1.funds.toNumber()
    const ptime=accinfo.currtime.toNumber()
    const initialamt=accinfo.amount.toNumber()
    const prevvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const prevrewards=accinfo.rewardpts.toNumber()
    await new Promise(res=>setTimeout(res,2000))
    const tx6=await program.methods.unstake(new BN(1000000)).accounts({signer:user1.publicKey}).signers([user1]).rpc()

    accinfo=await program.account.stakeAcc.fetch(stakeacc)
    accinfo1=await program.account.globalVault.fetch(vaultacc)
    const currvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const ctime=accinfo.currtime.toNumber()
    expect(accinfo.amount.toNumber()).to.equal(initialamt-1000000)
   expect(currvaultbal-prevvaultbal).to.equal(-1000000)
    let dur=ctime-ptime 
const rewards=prevrewards+Math.floor(((ctime-ptime)*initialamt*rate)/precision)
    expect(accinfo.rewardpts.toNumber()).to.equal(rewards)
    expect(accinfo1.funds.toNumber()).to.equal(prevfund-1000000)
  })

  it("12.Staking of amt by user2",async()=>{
   const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([user2.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vaultaccount")],program.programId)
     const [vaultacc,bump3]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault")],program.programId)
    let accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    let accinfo2=await program.account.globalVault.fetch(vaultacc)
    const prevfund=accinfo2.funds.toNumber()
    const prevvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const ptime=accinfo1.currtime.toNumber()
    const initialamt=accinfo1.amount.toNumber()
    const prevrewards=accinfo1.rewardpts.toNumber()
    const tx6=await program.methods.stake(new BN(3000)).accounts({signer:user2.publicKey}).signers([user2]).rpc()
    accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    accinfo2=await program.account.globalVault.fetch(vaultacc)
    const ctime=accinfo1.currtime.toNumber()
    const rewards=prevrewards+Math.floor(((ctime-ptime)*initialamt*rate)/precision)
    const currvaultbal=await anchor.getProvider().connection.getBalance(sysvault)

    expect(accinfo1.amount.toNumber()).to.equal(initialamt+3000)
    expect(currvaultbal-prevvaultbal).to.equal(3000)
    expect(accinfo1.rewardpts.toNumber()).to.equal(rewards)
    expect(accinfo2.funds.toNumber()).to.equal(prevfund+3000)

  })

  it("13.Staking of amt by user1",async()=>{
   const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([user1.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vaultaccount")],program.programId)
     const [vaultacc,bump3]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault")],program.programId)
    let accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    let accinfo2=await program.account.globalVault.fetch(vaultacc)
    const prevfund=accinfo2.funds.toNumber()
    const prevvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const ptime=accinfo1.currtime.toNumber()
    const initialamt=accinfo1.amount.toNumber()
    const prevrewards=accinfo1.rewardpts.toNumber()
    const tx7=await program.methods.stake(new BN(2000)).accounts({signer:user1.publicKey}).signers([user1]).rpc()
    accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    accinfo2=await program.account.globalVault.fetch(vaultacc)
    const ctime=accinfo1.currtime.toNumber()
    const rewards=prevrewards+Math.floor(((ctime-ptime)*initialamt*rate)/precision)
    const currvaultbal=await anchor.getProvider().connection.getBalance(sysvault)

    expect(accinfo1.amount.toNumber()).to.equal(initialamt+2000)
    expect(currvaultbal-prevvaultbal).to.equal(2000)
    expect(accinfo1.rewardpts.toNumber()).to.equal(rewards)
    expect(accinfo2.funds.toNumber()).to.equal(prevfund+2000)

  })
   it("14.Claim reward points for user1",async()=>{
   const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([user1.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vaultaccount")],program.programId)
     const [vaultacc,bump3]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault")],program.programId)
    let accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    let accinfo2=await program.account.globalVault.fetch(vaultacc)
    const prevfund=accinfo2.funds.toNumber()
    const prevvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const ptime=accinfo1.currtime.toNumber()
    const initialamt=accinfo1.amount.toNumber()
    const prevrewards=accinfo1.rewardpts.toNumber()
    const [mint,bump4]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("mint")],program.programId)
    const [prevuser1ata]=anchor.web3.PublicKey.findProgramAddressSync([user1.publicKey.toBuffer(),TOKEN_2022_PROGRAM_ID.toBuffer(),mint.toBuffer()],ASSOCIATED_TOKEN_PROGRAM_ID)
    const prevuser1atabal=await anchor.getProvider().connection.getTokenAccountBalance(prevuser1ata)

    const rewardpts=accinfo1.rewardpts.toNumber()
    const tx7=await program.methods.claimreward().accounts({signer:user1.publicKey}).signers([user1]).rpc()
    accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    accinfo2=await program.account.globalVault.fetch(vaultacc)
    const ctime=accinfo1.currtime.toNumber()
    // const rewards=prevrewards+(ctime-ptime)*initialamt
    const currvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const [curruser1ata]=anchor.web3.PublicKey.findProgramAddressSync([user1.publicKey.toBuffer(),TOKEN_2022_PROGRAM_ID.toBuffer(),mint.toBuffer()],ASSOCIATED_TOKEN_PROGRAM_ID)
    const curruser1atabal=await anchor.getProvider().connection.getTokenAccountBalance(curruser1ata)

    expect(accinfo1.amount.toNumber()).to.equal(initialamt)
    expect(currvaultbal-prevvaultbal).to.equal(0)
    expect(accinfo1.rewardpts.toNumber()).to.equal(0)
    expect(accinfo2.funds.toNumber()).to.equal(prevfund)
    expect(Number(curruser1atabal.value.amount)-Number(prevuser1atabal.value.amount)).to.equal(rewardpts)

  })
  it("15.Unstaking by user1 what is there in vault",async()=>{
   const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([user1.publicKey.toBuffer(),Buffer.from("stake")],program.programId)
    const [sysvault,bump2]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vaultaccount")],program.programId)

     const [vaultacc,bump3]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault")],program.programId)
    let accinfo=await program.account.stakeAcc.fetch(stakeacc)
    let accinfo1=await program.account.globalVault.fetch(vaultacc)
    const prevfund=accinfo1.funds.toNumber()
    const ptime=accinfo.currtime.toNumber()
    const initialamt=accinfo.amount.toNumber()
    const prevvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const prevrewards=accinfo.rewardpts.toNumber()
    await new Promise(res=>setTimeout(res,2000))
    const tx4=await program.methods.unstake(new BN(200000)).accounts({signer:user1.publicKey}).signers([user1]).rpc()

    accinfo=await program.account.stakeAcc.fetch(stakeacc)
    accinfo1=await program.account.globalVault.fetch(vaultacc)
    const currvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const ctime=accinfo.currtime.toNumber()
    expect(accinfo.amount.toNumber()).to.equal(initialamt-200000)
   expect(currvaultbal-prevvaultbal).to.equal(-200000)
    let dur=ctime-ptime 
const rewards=prevrewards+Math.floor(((ctime-ptime)*initialamt*rate)/precision)
    expect(accinfo.rewardpts.toNumber()).to.equal(rewards)
    expect(accinfo1.funds.toNumber()).to.equal(prevfund-200000)
    console.log(tx4)
  })
  it("16.Unauthorized user trying to unstake some other user's funds",async()=>{
    const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([user1.publicKey.toBuffer(),Buffer.from("stake")],program.programId)

    const [vaultacc,bump2]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault")],program.programId)

    const [sysvault,bump3]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vaultaccount")],program.programId)

    const prevvaultbal=await anchor.getProvider().connection.getBalance(sysvault)

    let accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    let accinfo2=await program.account.globalVault.fetch(vaultacc)
    const initialamt=accinfo1.amount.toNumber()
    const prevfund=accinfo2.funds.toNumber()
    const ptime=accinfo1.currtime.toNumber()
    const prevrewards=accinfo1.rewardpts.toNumber()
    try{
      const tx16=await program.methods.unstake(new BN(4000)).accounts({signer:user2.publicKey,stakeacc:stakeacc}).signers([user2]).rpc()
      accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    accinfo2=await program.account.globalVault.fetch(vaultacc)
    const ctime=accinfo1.currtime.toNumber()
    const dur=ctime-ptime
    const currvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
      expect(accinfo1.amount.toNumber()).to.equal(initialamt-4000)
      expect(accinfo2.funds.toNumber()).to.equal(prevfund-4000)
      expect(accinfo1.rewardpts.toNumber()).to.equal(prevrewards+Math.floor(((ctime-ptime)*initialamt*rate)/precision))
      expect(accinfo1.staker.toBase58()).to.equal(user2.publicKey.toBase58())
      expect(currvaultbal-prevvaultbal).to.equal(-4000)
    }
    catch(err){
      expect(err.toString()).to.include("ConstraintSeeds")
    }
  })

  it("17.User3 trying to unstake more than the vault's funds",async()=>{
    const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([user3.publicKey.toBuffer(),Buffer.from("stake")],program.programId)

    const [vaultacc,bump2]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault")],program.programId)

    const[sysvault,bump3]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vaultaccount")],program.programId)

   try{
     const tx17=await program.methods.unstake(new BN(99999999999999)).accounts({signer:user3.publicKey}).signers([user3]).rpc()
   }
   catch(err){
    expect(err.error.errorCode.code).to.equal("UnStakeAmountError")
   }

  })

  // it("18.Trying to stake nearly 10 times by user3 by giving 1500 lamports by user3",async()=>{
  //   const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([user3.publicKey.toBuffer(),Buffer.from("stake")],program.programId)

  //   const [vaultacc,bump2]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault")],program.programId)

  //   const [sysvault,bump3]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vaultaccount")],program.programId)
  //   const prevvaultbal=await anchor.getProvider().connection.getBalance(sysvault)

  //   let accinfo1;
  //   let accinfo2=await program.account.globalVault.fetch(vaultacc)
  //   let reward=0
  //   let prevfund=accinfo2.funds.toNumber()
  //   let initialamt;
    
  //   for(let i=0;i<10;i++){
  //     accinfo1=await program.account.stakeAcc.fetch(stakeacc)
  //     const ptime=accinfo1.currtime.toNumber()
  //     initialamt=accinfo1.amount.toNumber()
  //     const tx18=await program.methods.stake(new BN(1500)).accounts({signer:user3.publicKey}).signers([user3]).rpc()
  //     accinfo1=await program.account.stakeAcc.fetch(stakeacc)
  //     const ctime=accinfo1.currtime.toNumber()
  //      const dur=ctime-ptime 
  //     reward+=initialamt*dur
  //   }
  //   accinfo1=await program.account.stakeAcc.fetch(stakeacc)
  //   accinfo2=await program.account.globalVault.fetch(vaultacc)
    
   
  //   const currvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
  //   expect(accinfo1.amount.toNumber()).to.equal(initialamt+15000)
  //   expect(accinfo1.staker.toBase58()).to.equal(user3.publicKey.toBase58())
  //   expect(accinfo1.rewardpts.toNumber()).to.equal(reward)
  //   expect(accinfo2.funds.toNumber()).to.equal(prevfund+15000)
  //   expect(currvaultbal-prevvaultbal).to.equal(15000)
  // })

  it("18.User3 unstaking whatever he staked",async()=>{
    const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([user3.publicKey.toBuffer(),Buffer.from("stake")],program.programId)

    const [vaultacc,bump2]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault")],program.programId)

    const [sysvault,bump3]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vaultaccount")],program.programId)
    const prevvaultbal=await anchor.getProvider().connection.getBalance(sysvault)

    let accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    let accinfo2=await program.account.globalVault.fetch(vaultacc)
    const initialamt=accinfo1.amount.toNumber()
    const prevfund=accinfo2.funds.toNumber()
    const ptime=accinfo1.currtime.toNumber()
    const prevrewards=accinfo1.rewardpts.toNumber()
    const tx=await program.methods.unstake(new BN(initialamt)).accounts({signer:user3.publicKey}).signers([user3]).rpc()
    accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    accinfo2=await program.account.globalVault.fetch(vaultacc)
    const ctime=accinfo1.currtime.toNumber()
    const dur=ctime-ptime 
    const currvaultbal=await anchor.getProvider().connection.getBalance(sysvault)
    const rewards=prevrewards+Math.floor(((ctime-ptime)*initialamt*rate)/precision)
    expect(accinfo1.amount.toNumber()).to.equal(0)
    expect(accinfo1.staker.toBase58()).to.equal(user3.publicKey.toBase58())
    expect(accinfo1.rewardpts.toNumber()).to.equal(rewards)
    expect(accinfo2.funds.toNumber()).to.equal(prevfund-initialamt)
    expect(currvaultbal-prevvaultbal).to.equal(-initialamt)
  })

  it("19.User3 trying to claim rewards",async()=>{
    const [stakeacc,bump1]=anchor.web3.PublicKey.findProgramAddressSync([user3.publicKey.toBuffer(),Buffer.from("stake")],program.programId)

    const [vaultacc,bump2]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault")],program.programId)

    const [sysvault,bump3]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vaultaccount")],program.programId)
    const prevvaultbal=await anchor.getProvider().connection.getBalance(sysvault)

    let accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    let accinfo2=await program.account.globalVault.fetch(vaultacc)
    const initialamt=accinfo1.amount.toNumber()
    const prevfund=accinfo2.funds.toNumber()
    const ptime=accinfo1.currtime.toNumber()
    const [mint,bump4]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("mint")],program.programId)

    const [prevuser3ata]=anchor.web3.PublicKey.findProgramAddressSync([user3.publicKey.toBuffer(),TOKEN_2022_PROGRAM_ID.toBuffer(),mint.toBuffer()],ASSOCIATED_TOKEN_PROGRAM_ID)
    const prevuser3atabal=await anchor.getProvider().connection.getTokenAccountBalance(prevuser3ata)

    const rewardpts=accinfo1.rewardpts.toNumber()

    const tx=await program.methods.claimreward().accounts({signer:user3.publicKey}).signers([user3]).rpc()
    accinfo1=await program.account.stakeAcc.fetch(stakeacc)
    accinfo2=await program.account.globalVault.fetch(vaultacc)
    const ctime=accinfo1.currtime.toNumber()
    const dur=ctime-ptime 
    const currvaultbal=await anchor.getProvider().connection.getBalance(sysvault)

    const [curruser3ata]=anchor.web3.PublicKey.findProgramAddressSync([user3.publicKey.toBuffer(),TOKEN_2022_PROGRAM_ID.toBuffer(),mint.toBuffer()],ASSOCIATED_TOKEN_PROGRAM_ID)
    const curruser3atabal=await anchor.getProvider().connection.getTokenAccountBalance(curruser3ata)

    expect(accinfo1.amount.toNumber()).to.equal(initialamt)
    expect(accinfo1.staker.toBase58()).to.equal(user3.publicKey.toBase58())
    expect(accinfo1.rewardpts.toNumber()).to.equal(0)
    expect(accinfo2.funds.toNumber()).to.equal(prevfund)
    expect(currvaultbal-prevvaultbal).to.equal(0)
    expect(Number(curruser3atabal.value.amount)-Number(prevuser3atabal.value.amount)).to.equal(rewardpts)
  })
  
});