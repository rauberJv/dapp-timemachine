use anchor_lang::prelude::*;

use crate::instructions::*;
declare_id!("EGVnVqs8pzjUFxjrovN9jsjipUGKh9J2g9vTtBZnaVBV");

pub mod errors;
pub mod instructions;
pub mod state;

#[program]
pub mod timemachine_dapp {
    use super::*;

    pub fn initialize(ctx: Context<InitializeCapsule>, open_date: String) -> Result<()> {
        initialize_capsule(ctx, open_date)
    }

    pub fn create_letter(ctx: Context<AddLetterContext>, letter_content: String) -> Result<()> {
        msg!("Calling create_letter");
        return add_letter(ctx, letter_content);
    }
}

#[derive(Accounts)]
pub struct Initialize {}
