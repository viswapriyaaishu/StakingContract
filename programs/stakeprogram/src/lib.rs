use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer,Transfer};
use anchor_spl::{token_2022::{spl_token_2022::{extension::ExtensionType,pod::PodMint}},token_interface::{Token2022,TokenAccount,mint_to,MintTo,Mint,token_metadata_initialize,TokenMetadataInitialize,InitializeMint2,MetadataPointerInitialize,mint_close_authority_initialize,MintCloseAuthorityInitialize},associated_token::{AssociatedToken}};

use spl_token_metadata_interface::state::{TokenMetadata};
use spl_type_length_value::variable_len_pack::VariableLenPack;

declare_id!("DrdSnPNH2a7cBQ7S5LpD7Wydrz8itBXyfKV1rF4CJjiB");

const PRECISION:u64=100_000_000;
const RATE:u64=1;

#[program]
pub mod stakeprogram {
    use super::*;

    pub fn initializevault(ctx:Context<InitializeVault>)->Result<()>{
        let vaultacc=&mut ctx.accounts.vaultacc;
        vaultacc.vaultbump=ctx.bumps.vaultacc;
        vaultacc.vaultaccbump=ctx.bumps.sysvault;
        vaultacc.funds=0;
        vaultacc.mintbump=ctx.bumps.mint;
        vaultacc.mintauthbump=ctx.bumps.mintauthority;

        // let ctx1=CpiContext::new(ctx.accounts.system_program.to_account_info(),Transfer{from:ctx.accounts.admin.to_account_info(),to:ctx.accounts.sysvault.to_account_info()});
        // transfer(ctx1,Rent::get()?.minimum_balance(0))?;
        let tokenname="Shinchan".to_string();
        let tokensym="SCN".to_string();
        let uri="https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json".to_string();

        let tokenmetadata=TokenMetadata{
            name:tokenname.clone(),
            symbol:tokensym.clone(),
            uri:uri.clone(),
            ..Default::default()
        };

        let tokenmetadatalen=tokenmetadata.get_packed_len().map_err(|_| error!(CustomErrors::MetaDataLenError))?;

        let extensionlen=ExtensionType::try_calculate_account_len::<PodMint>(&[ExtensionType::MetadataPointer,ExtensionType::MintCloseAuthority])?;
      
        let rent=Rent::get()?.minimum_balance(tokenmetadatalen+extensionlen);

        let ctx2=CpiContext::new(ctx.accounts.system_program.to_account_info(),Transfer{from:ctx.accounts.admin.to_account_info(),to:ctx.accounts.mint.to_account_info()});
        transfer(ctx2,rent)?;

        let bump=&[vaultacc.mintauthbump];
        let seeds=&[&[b"mintauthority".as_ref(),bump][..]];

    //     let ctx3=CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(),MintCloseAuthorityInitialize{token_program_id:ctx.accounts.token_program.to_account_info(),mint:ctx.accounts.mint.to_account_info()},seeds);

    // mint_close_authority_initialize(ctx3,Some(&ctx.accounts.admin.key()))?;

    let ctx4=CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(),
    TokenMetadataInitialize{
        program_id:ctx.accounts.token_program.to_account_info(),
        mint:ctx.accounts.mint.to_account_info(),
        metadata:ctx.accounts.mint.to_account_info(),
        update_authority:ctx.accounts.mintauthority.to_account_info(),
        mint_authority:ctx.accounts.mintauthority.to_account_info()
    },seeds);
    token_metadata_initialize(ctx4,tokenname,tokensym,uri)?;

        Ok(())
    }
    pub fn initializestakeacc(ctx: Context<InitializeStakeAcc>) -> Result<()> {
       let stakeacc=&mut ctx.accounts.stakeacc;
       stakeacc.staker=ctx.accounts.signer.key();
        stakeacc.amount=0;
        stakeacc.currtime=Clock::get()?.unix_timestamp;
        stakeacc.rewardpts=0;
        stakeacc.bump=ctx.bumps.stakeacc;
        Ok(())
    }

    pub fn stake(ctx:Context<Stake>,amt:u64)->Result<()>{
        require!(amt>0,CustomErrors::StakeAmountError);
        let stakeacc=&mut ctx.accounts.stakeacc;
        let vaultacc=&mut ctx.accounts.vaultacc;
        let ptime=stakeacc.currtime;
        let ctime=Clock::get()?.unix_timestamp;
        let duration=ctime-ptime;
        require!(duration>=0,CustomErrors::DurationError);
        let dur=duration as u64;
        let reward=dur.checked_mul(stakeacc.amount).ok_or(CustomErrors::OverFlowError)?.checked_mul(RATE).ok_or(CustomErrors::OverFlowError)?.checked_div(PRECISION).ok_or(CustomErrors::OverFlowError)?;
        let cpicontext=CpiContext::new(ctx.accounts.system_program.to_account_info(),Transfer{from:ctx.accounts.signer.to_account_info(),to:ctx.accounts.sysvault.to_account_info()});

        transfer(cpicontext,amt)?;
        
        stakeacc.currtime=ctime;
        stakeacc.amount=stakeacc.amount.checked_add(amt).ok_or(CustomErrors::OverFlowError)?;
        stakeacc.rewardpts=stakeacc.rewardpts.checked_add(reward).ok_or(CustomErrors::OverFlowError)?;
        vaultacc.funds=vaultacc.funds.checked_add(amt).ok_or(CustomErrors::OverFlowError)?;
        msg!("staked {} amount now amt i have is {}",amt,stakeacc.amount);
        Ok(())
    }

    pub fn unstake(ctx:Context<Unstake>,amt:u64)->Result<()>{
        let stakeacc=&mut ctx.accounts.stakeacc;
        let vaultacc=&mut ctx.accounts.vaultacc;
         require!(stakeacc.amount>=amt,CustomErrors::UnStakeAmountError);
         require!(ctx.accounts.sysvault.to_account_info().lamports()>=amt,CustomErrors::InsufficientFundError);
         let ctime=Clock::get()?.unix_timestamp;
        let stime=stakeacc.currtime;
        let duration=ctime-stime;
        require!(duration>=0,CustomErrors::DurationError);
        let dur=duration as u64;
        let bump=&[vaultacc.vaultaccbump];
        let seeds=&[&[b"vaultaccount".as_ref(),bump][..]];
        let cpicontext=CpiContext::new_with_signer(ctx.accounts.system_program.to_account_info(),Transfer{from:ctx.accounts.sysvault.to_account_info(),to:ctx.accounts.signer.to_account_info()},seeds);

        transfer(cpicontext,amt)?;
        let durr=dur.checked_mul(stakeacc.amount).ok_or(CustomErrors::OverFlowError)?.checked_mul(RATE).ok_or(CustomErrors::OverFlowError)?.checked_div(PRECISION).ok_or(CustomErrors::OverFlowError)?;
        stakeacc.rewardpts=stakeacc.rewardpts.checked_add(durr).ok_or(CustomErrors::OverFlowError)?;
        stakeacc.amount=stakeacc.amount.checked_sub(amt).ok_or(CustomErrors::OverFlowError)?;
        stakeacc.currtime=ctime;
        vaultacc.funds=vaultacc.funds.checked_sub(amt).ok_or(CustomErrors::OverFlowError)?;

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
        stakeacc.rewardpts=stakeacc.rewardpts.checked_add(dur.checked_mul(stakeacc.amount).ok_or(CustomErrors::OverFlowError)?.checked_mul(RATE).ok_or(CustomErrors::OverFlowError)?.checked_div(PRECISION).ok_or(CustomErrors::OverFlowError)?).ok_or(CustomErrors::OverFlowError)?;
        let reward=stakeacc.rewardpts;

        let bump=&[ctx.accounts.vaultacc.mintauthbump];
        let seeds=&[&[b"mintauthority".as_ref(),bump][..]];

        let mintcpi=CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(),
    MintTo{
        mint:ctx.accounts.mint.to_account_info(),
        to:ctx.accounts.associateduserata.to_account_info(),
        authority:ctx.accounts.authority.to_account_info()
    },seeds
    );

    mint_to(mintcpi,reward)?;
         stakeacc.rewardpts=0;
        stakeacc.currtime=ctime;
        msg!("Reward claimed with {} points",reward);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeVault<'info>{
    #[account(mut)]
    pub admin:Signer<'info>,

    #[account(init,payer=admin,space=8+GlobalVault::INIT_SPACE,seeds=[b"vault"],bump)]
    pub vaultacc:Account<'info,GlobalVault>,

    #[account(seeds=[b"vaultaccount"],bump)]
     /// CHECK:This is system account pda being created to store funds globally
    pub sysvault:SystemAccount<'info>,

    #[account(init,payer=admin,seeds=[b"mint"],bump,mint::authority=mintauthority,mint::decimals=7,mint::token_program=token_program,extensions::metadata_pointer::authority=mintauthority,extensions::metadata_pointer::metadata_address=mint,
extensions::close_authority::authority=admin)]
    pub mint:InterfaceAccount<'info,Mint>,

    #[account(mut,seeds=[b"mintauthority"],bump)]
    /// CHECK: serving as a mint authority
    pub mintauthority:UncheckedAccount<'info>,
    pub token_program:Program<'info,Token2022>,
    pub system_program:Program<'info,System>
}

#[derive(Accounts)]
pub struct InitializeStakeAcc<'info>{
    #[account(init,payer=signer,space=8+StakeAcc::INIT_SPACE,seeds=[signer.key().as_ref(),b"stake"],bump)]
    pub stakeacc:Account<'info,StakeAcc>,
    #[account(mut)]
    pub signer:Signer<'info>,
    #[account(seeds=[b"vault"],bump=vaultacc.vaultbump)]
    vaultacc:Account<'info,GlobalVault>,
    #[account(seeds=[b"mint"],bump=vaultacc.mintbump)]
    pub mint:InterfaceAccount<'info,Mint>,
    #[account(init,payer=signer,associated_token::mint=mint,associated_token::authority=signer,associated_token::token_program=token_program)]
    pub associateduserata:InterfaceAccount<'info,TokenAccount>,
    #[account(seeds=[b"mintauthority"],bump=vaultacc.mintauthbump)]
    /// CHECK: serving as a mint authority
    pub authority:UncheckedAccount<'info>,
    pub token_program:Program<'info,Token2022>,
    pub associated_token_program:Program<'info,AssociatedToken>,
    pub system_program:Program<'info,System>
}

#[derive(Accounts)]
pub struct Stake<'info>{
    #[account(mut)]
    pub signer:Signer<'info>,
    #[account(mut,seeds=[signer.key().as_ref(),b"stake"],bump=stakeacc.bump,constraint=stakeacc.staker==signer.key())]
    pub stakeacc:Account<'info,StakeAcc>,
    #[account(mut,seeds=[b"vault"],bump=vaultacc.vaultbump)]
    pub vaultacc:Account<'info,GlobalVault>,
    #[account(mut,seeds=[b"vaultaccount"],bump=vaultacc.vaultaccbump)]
    /// CHECK:This is system account pda being created to store funds globally
    pub sysvault:SystemAccount<'info>,
    pub system_program:Program<'info,System>
}

#[derive(Accounts)]
pub struct Unstake<'info>{
    #[account(mut)]
    pub signer:Signer<'info>,
    #[account(mut,seeds=[signer.key().as_ref(),b"stake"],bump=stakeacc.bump,constraint=stakeacc.staker==signer.key())]
    pub stakeacc:Account<'info,StakeAcc>,
    #[account(mut,seeds=[b"vault"],bump=vaultacc.vaultbump)]
    pub vaultacc:Account<'info,GlobalVault>,
    #[account(mut,seeds=[b"vaultaccount"],bump=vaultacc.vaultaccbump)]
    /// CHECK:This is system account pda being created to store funds globally
    pub sysvault:SystemAccount<'info>,
    pub system_program:Program<'info,System>
}

#[derive(Accounts)]
pub struct ClaimReward<'info>{
#[account(mut)]
pub signer:Signer<'info>,
#[account(mut,seeds=[signer.key().as_ref(),b"stake"],bump=stakeacc.bump,constraint=stakeacc.staker==signer.key())]
pub stakeacc:Account<'info,StakeAcc>,
#[account(seeds=[b"vault"],bump=vaultacc.vaultbump)]
pub vaultacc:Account<'info,GlobalVault>,
#[account(mut,seeds=[b"mint"],bump=vaultacc.mintbump)]
pub mint:InterfaceAccount<'info,Mint>,
#[account(mut,associated_token::mint=mint,associated_token::authority=signer,associated_token::token_program=token_program)]
pub associateduserata:InterfaceAccount<'info,TokenAccount>,
#[account(seeds=[b"mintauthority"],bump=vaultacc.mintauthbump)]
/// CHECK: serving as a mint authority
pub authority:UncheckedAccount<'info>,
pub token_program:Program<'info,Token2022>,
pub associated_token_program:Program<'info,AssociatedToken>,
pub system_program:Program<'info,System>
}

#[account]
#[derive(InitSpace)]
pub struct StakeAcc{
    pub staker:Pubkey,
    pub amount:u64,
    pub currtime:i64,
    pub rewardpts:u64,
    pub bump:u8
}

#[account]
#[derive(InitSpace)]
pub struct GlobalVault{
    pub vaultbump:u8,
    pub funds:u64,
    pub vaultaccbump:u8,
    pub mintbump:u8,
    pub mintauthbump:u8
}
#[error_code]
pub enum CustomErrors{
    #[msg("Amount to be staked must be greater than 0")]
    StakeAmountError,
    #[msg("Duration must be proper with current time being greater than prev time")]
    DurationError,
    #[msg("Amount to be unstaked must be less than or equal to the amount staked")]
    UnStakeAmountError,
    #[msg("Overflow Error")]
    OverFlowError,
    #[msg("Insufficient funds")]
    InsufficientFundError,
    #[msg("Unauthorized to stake")]
    UnauthorizedStakeError,
    #[msg("Error in computing metadata structure len")]
    MetaDataLenError
}