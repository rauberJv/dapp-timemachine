use anchor_lang::prelude::*;

#[error_code]
pub enum CapsuleError {
    #[msg("Capsule closed, wait more years to open.")]
    CapsuleClosed,
    #[msg("Your letter is too long for the machine.")]
    LetterTooLong,
    #[msg("Sorry, this machine does not fit any more letter.")]
    MaximumLetterReached,
}
