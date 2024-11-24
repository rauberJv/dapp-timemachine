use anchor_lang::prelude::*;

use crate::errors::CapsuleError;
use crate::state::*;

pub fn initialize_capsule(
    ctx: Context<InitializeCapsule>,
    open_date: String,
) -> Result<()> {
    let initialized_capsule = &mut ctx.accounts.capsule;

    require!(
        open_date.as_bytes().len() <= MAX_DATE_LENGTH,
        CapsuleError::LetterTooLong
    );

    let mut open_date_data = [0u8; MAX_DATE_LENGTH];
    open_date_data[..open_date.as_bytes().len()].copy_from_slice(open_date.as_bytes());
    
    initialized_capsule.open_date = open_date_data;   
    initialized_capsule.capsule_author = ctx.accounts.capsule_authority.key();
    initialized_capsule.bump = ctx.bumps.capsule;
    initialized_capsule.letter_count = 0;

    Ok(())

}

#[derive(Accounts)]
#[instruction(open_date: String)]
pub struct InitializeCapsule<'info> {
    #[account(mut)]
    pub capsule_authority: Signer<'info>,
    #[account(
        init,
        payer = capsule_authority,
        space = 8 + Capsule::LEN,
        seeds = [
            open_date.as_bytes(),
            CAPSULE_SEED.as_bytes(),
            capsule_authority.key().as_ref()
        ],
        bump)]
    pub capsule: Account<'info, Capsule>,
    pub system_program: Program<'info, System>
}
