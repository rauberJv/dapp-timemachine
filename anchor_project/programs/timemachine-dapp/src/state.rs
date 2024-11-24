use anchor_lang::prelude::*;

pub const LETTER_LENGTH: usize = 500;
pub const MAX_LETTER_COUNT: u8 = 10;
pub const MAX_DATE_LENGTH: usize = 10;

pub const CAPSULE_SEED: &str = "CAPSULE_SEED";
pub const LETTER_SEED: &str = "LETTER_SEED";

#[account]
pub struct Capsule {
    pub capsule_author: Pubkey,
    pub open_date: [u8; MAX_DATE_LENGTH],
    pub letter_count: u8,
    pub bump: u8
}

impl Capsule {
    pub const LEN: usize = 32 + MAX_DATE_LENGTH + 1 + 1;
}

#[account]
pub struct Letter {
    pub letter_author: Pubkey,
    pub capsule: Pubkey,
    pub content: [u8; LETTER_LENGTH],
    pub content_length: u16,
    pub bump: u8
}

impl Letter {
    pub const LEN: usize = 32 + 32 + LETTER_LENGTH + 2 + 1;
}

