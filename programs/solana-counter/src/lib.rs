use anchor_lang::prelude::*;
declare_id!("8Tkf3PaBmF829sqkGTqUXvJvzQ8AcCC3WhBFBHhvLrQ6");

#[program]
pub mod solana_counter {

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = u8::MIN;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        if counter.count == u8::MAX {
            return Err(ErrorCode::CounterTooLong.into());
        }
        counter.count += 1;
        Ok(())
    }

    pub fn decrement(ctx: Context<Decrement>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        if counter.count == u8::MIN {
            return Err(ErrorCode::NegativeCounter.into());
        }
        counter.count -= 1;
        Ok(())
    }

    pub fn set_counter(ctx: Context<SetCounter>, new_value: u8) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        if new_value == u8::MAX {
            return Err(ErrorCode::CounterTooLong.into());
        }
        if new_value == u8::MIN {
            return Err(ErrorCode::NegativeCounter.into());
        }
        counter.count = new_value;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = owner, space = 8 + 8)]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    counter: Account<'info, Counter>,
}

#[derive(Accounts)]
pub struct Decrement<'info> {
    #[account(mut)]
    counter: Account<'info, Counter>,
}

#[derive(Accounts)]
pub struct SetCounter<'info> {
    #[account(mut)]
    counter: Account<'info, Counter>,
}

#[account]
pub struct Counter {
    pub count: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Counter should be positive.")]
    NegativeCounter,
    #[msg("Counter is too long, max value 255.")]
    CounterTooLong,
}
