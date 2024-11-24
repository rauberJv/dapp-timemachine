use anchor_lang::prelude::*;

use crate::errors::CapsuleError;
use crate::state::*;

pub fn add_letter(
    ctx: Context<AddLetterContext>,
    letter_content: String
) -> Result<()> {
    let letter = &mut ctx.accounts.letter;
    let capsule = &mut ctx.accounts.capsule;

    require!(
        capsule.letter_count < 10,
        CapsuleError::MaximumLetterReached
    );
    
    require!(
        letter_content.as_bytes().len() <= LETTER_LENGTH,
        CapsuleError::LetterTooLong
    );
    
    let mut letter_data = [0u8; LETTER_LENGTH];
    letter_data[..letter_content.as_bytes().len()].copy_from_slice(letter_content.as_bytes());
    

    capsule.letter_count = capsule.letter_count + 1;
    letter.letter_author = ctx.accounts.letter_author.key();
    letter.capsule = ctx.accounts.capsule.key();
    letter.content = letter_data;
    letter.content_length = letter_content.as_bytes().len() as u16;
    letter.bump = ctx.bumps.letter;

    Ok(())
}

#[derive(Accounts)]
#[instruction(letter_content: String)]
pub struct AddLetterContext<'info> {
    #[account(mut)]
    pub letter_author: Signer<'info>,
    #[account(
        init,
        payer = letter_author,
        space = 8 + Letter::LEN,
        seeds = [
            LETTER_SEED.as_bytes(),
            letter_author.key().as_ref(),
            {anchor_lang::solana_program::hash::hash(letter_content.as_bytes()).to_bytes().as_ref()},
            capsule.key().as_ref(),            
        ],
        bump
    )]
    pub letter: Account<'info, Letter>,
    #[account(
        mut,
        seeds = [
            capsule.open_date[..MAX_DATE_LENGTH as usize].as_ref(),
            CAPSULE_SEED.as_bytes(),
            capsule.capsule_author.key().as_ref()
        ],
        bump = capsule.bump
    )]
    pub capsule: Account<'info, Capsule>,
    pub system_program: Program<'info, System>,
}