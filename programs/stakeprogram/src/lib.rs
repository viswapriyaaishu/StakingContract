use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer,Transfer};
use anchor_spl::{token::{Token,TokenAccount,mint_to,MintTo,Mint},associated_token::{AssociatedToken}};

declare_id!("DrdSnPNH2a7cBQ7S5LpD7Wydrz8itBXyfKV1rF4CJjiB");

#[program]
pub mod stakeprogram {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
       let stakeacc=&mut ctx.accounts.stakeacc;
       stakeacc.staker=ctx.accounts.signer.key();
        stakeacc.amount=0;
        stakeacc.currtime=Clock::get()?.unix_timestamp;
        stakeacc.rewardpts=0;
        stakeacc.abump=ctx.bumps.stakeacc;
        stakeacc.vbump=ctx.bumps.sysvault;
        Ok(())
    }

    pub fn stake(ctx:Context<Stake>,amt:u64)->Result<()>{
        require!(amt>0,CustomErrors::StakeAmountError);
        let stakeacc=&mut ctx.accounts.stakeacc;
        let ptime=stakeacc.currtime;
        let ctime=Clock::get()?.unix_timestamp;
        let duration=ctime-ptime;
        require!(duration>=0,CustomErrors::DurationError);
        let dur=duration as u64;
        let reward=dur*stakeacc.amount;

        let cpicontext=CpiContext::new(ctx.accounts.system_program.to_account_info(),Transfer{from:ctx.accounts.signer.to_account_info(),to:ctx.accounts.sysvault.to_account_info()});

        transfer(cpicontext,amt)?;
        
        stakeacc.currtime=ctime;
        stakeacc.amount=stakeacc.amount.checked_add(amt).ok_or(CustomErrors::OverFlowError)?;
        stakeacc.rewardpts=stakeacc.rewardpts.checked_add(reward).ok_or(CustomErrors::OverFlowError)?;
        msg!("staked {} amount now amt i have is {}",amt,stakeacc.amount);
        Ok(())
    }

    pub fn unstake(ctx:Context<Unstake>,amt:u64)->Result<()>{
        let stakeacc=&mut ctx.accounts.stakeacc;
         require!(ctx.accounts.sysvault.to_account_info().lamports()>=amt,CustomErrors::InsufficientFundError);
        require!(stakeacc.amount>=amt,CustomErrors::UnStakeAmountError);
        let ctime=Clock::get()?.unix_timestamp;
        let stime=stakeacc.currtime;
        let duration=ctime-stime;
        require!(duration>=0,CustomErrors::DurationError);
        let dur=duration as u64;
        let bump=&[stakeacc.vbump];
        let seeds=&[&[stakeacc.staker.as_ref(),b"vault",bump][..]];
        let cpicontext=CpiContext::new_with_signer(ctx.accounts.system_program.to_account_info(),Transfer{from:ctx.accounts.sysvault.to_account_info(),to:ctx.accounts.signer.to_account_info()},seeds);

        transfer(cpicontext,amt)?;
        let durr=dur.checked_mul(stakeacc.amount).ok_or(CustomErrors::OverFlowError)?;
        stakeacc.rewardpts=stakeacc.rewardpts.checked_add(durr).ok_or(CustomErrors::OverFlowError)?;
        stakeacc.amount=stakeacc.amount.checked_sub(amt).ok_or(CustomErrors::OverFlowError)?;
        stakeacc.currtime=ctime;

        msg!("Unstaked {} amount now amt i have is {}",amt,stakeacc.amount);
        Ok(())
    }

    pub fn claimreward(ctx:Context<ClaimReward>)->Result<()>{
        let stakeacc=&mut ctx.accounts.stakeacc;
        
        let ptime=stakeacc.currtime;
        let ctime=Clock::get()?.unix_timestamp;
        let duration=(ctime-ptime);
        require!(duration>=0,CustomErrors::DurationError);
        let dur=duration as u64;
        stakeacc.rewardpts=stakeacc.rewardpts.checked_add(dur.checked_mul(stakeacc.amount).ok_or(CustomErrors::OverFlowError)?).ok_or(CustomErrors::OverFlowError)?;
        let reward=stakeacc.rewardpts;

        // mint_to(mint.publicKey,ata.publicKey,ctx.accounts.signer,reward,[],TOKEN_2022_PROGRAM_ID)
         stakeacc.rewardpts=0;
        stakeacc.currtime=ctime;
        msg!("Reward claimed with {} points",reward);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info>{
    #[account(init,payer=signer,space=8+StakeAcc::INIT_SPACE,seeds=[signer.key().as_ref(),b"stake"],bump)]
    pub stakeacc:Account<'info,StakeAcc>,
    #[account(seeds=[signer.key().as_ref(),b"vault"],bump)]
    /// CHECK:This is system account pda being created to store funds for each user
    pub sysvault:SystemAccount<'info>,
    #[account(mut)]
    pub signer:Signer<'info>,
    pub system_program:Program<'info,System>
}

#[derive(Accounts)]
pub struct Stake<'info>{
    #[account(mut)]
    pub signer:Signer<'info>,
    #[account(mut,seeds=[signer.key().as_ref(),b"stake"],bump,constraint=stakeacc.staker==signer.key())]
    pub stakeacc:Account<'info,StakeAcc>,
    #[account(mut,seeds=[signer.key().as_ref(),b"vault"],bump)]
    /// CHECK:This is system account pda being created to store funds for each user
    pub sysvault:SystemAccount<'info>,
    pub system_program:Program<'info,System>
}

#[derive(Accounts)]
pub struct Unstake<'info>{
    #[account(mut)]
    pub signer:Signer<'info>,
    #[account(mut,seeds=[signer.key().as_ref(),b"stake"],bump,constraint=stakeacc.staker==signer.key())]
    pub stakeacc:Account<'info,StakeAcc>,
    #[account(mut,seeds=[signer.key().as_ref(),b"vault"],bump)]
    /// CHECK:This is system account pda being created to store funds for each user
    pub sysvault:SystemAccount<'info>,
    pub system_program:Program<'info,System>
}

#[derive(Accounts)]
pub struct ClaimReward<'info>{
pub signer:Signer<'info>,
#[account(mut,seeds=[signer.key().as_ref(),b"stake"],bump,constraint=stakeacc.staker==signer.key())]
pub stakeacc:Account<'info,StakeAcc>
}

#[account]
#[derive(InitSpace)]
pub struct StakeAcc{
    pub staker:Pubkey,
    pub amount:u64,
    pub currtime:i64,
    pub rewardpts:u64,
    pub abump:u8,
    pub vbump:u8
}

#[error_code]
pub enum CustomErrors{
    #[msg("Amount to be staked must be greater than 0")]
    StakeAmountError,
    #[msg("Duration must be proper with current time being greater than prev time")]
    DurationError,
    #[msg("Amount to be staked must be greater than or equal to the staked amount")]
    UnStakeAmountError,
    #[msg("Overflow Error")]
    OverFlowError,
    #[msg("Insufficient funds")]
    InsufficientFundError
}