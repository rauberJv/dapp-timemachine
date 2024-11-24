import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TimemachineDapp } from "../target/types/timemachine_dapp";
import { PublicKey } from "@solana/web3.js"
import { assert, should } from "chai";
import crypto from "crypto";
import { BN } from "bn.js";

const CAPSULE_SEED = "CAPSULE_SEED";
const LETTER_SEED = "LETTER_SEED";

describe("Time Machine Descentralized App", () => {
  const provider = anchor.AnchorProvider.env();
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.TimemachineDapp as Program<TimemachineDapp>;

  const luis = anchor.web3.Keypair.generate();
  const fernando = anchor.web3.Keypair.generate();
  const isabelle = anchor.web3.Keypair.generate();
  const geci = anchor.web3.Keypair.generate();
  const gump = anchor.web3.Keypair.generate();

  const first_capsule_date = "30-06-2025";
  const second_capsule_Date = "31-12-2025";

  describe("Initializing Capsules", async() => {
    it("Initialize 1st Capsule", async() => {
      await airdrop(provider.connection, luis.publicKey);
      const [capsule_pkey, capsule_bump] = getCapsuleAddress(first_capsule_date, luis.publicKey, program.programId);
      await program.methods.initialize(first_capsule_date).accounts({
        capsuleAuthority: luis.publicKey
      }).signers([luis]).rpc({ commitment: "confirmed"});
      await checkCapsule(
        program,
        capsule_pkey,
        luis.publicKey,
      );
    });

    it("Initialize 2nd Capsule", async() => {
      await airdrop(provider.connection, fernando.publicKey);
      const [capsule_pkey, capsule_bump] = getCapsuleAddress(second_capsule_Date, fernando.publicKey, program.programId);
      await program.methods.initialize(second_capsule_Date).accounts({
        capsuleAuthority: fernando.publicKey
      }).signers([fernando]).rpc({ commitment: "confirmed"});
      await checkCapsule(
        program,
        capsule_pkey,
        fernando.publicKey
      );
    })
  });

  describe("Adding letters to capsules", async () => {
    it("Fernando add a letter to Luis Capsule", async () => {
      await airdrop(provider.connection, luis.publicKey);
      await airdrop(provider.connection, fernando.publicKey);
      const [capsule_pkey, capsule_bump] = getCapsuleAddress(first_capsule_date, luis.publicKey, program.programId);
      
      const letter_content = "Hello from the past!";
      const [letter_pkey, letter_bump] = getLetterAddress(capsule_pkey, letter_content, fernando.publicKey, program.programId);

      await program.methods.createLetter(letter_content).accounts({
        letter: letter_pkey,
        letterAuthor: fernando.publicKey,
        capsule: capsule_pkey,
        systemProgram: anchor.web3.SystemProgram.programId
      }).signers([fernando]).rpc({commitment: "confirmed"});

      await checkLetter(
        program,
        letter_pkey,
        capsule_pkey,
        fernando.publicKey,
        letter_content
      );
    });

    it("Fernando tried to add a letter when there was already 10 letters in the capsule but it fails", async () => {
      await airdrop(provider.connection, luis.publicKey);
      await airdrop(provider.connection, fernando.publicKey);
      const [capsule_pkey, capsule_bump] = getCapsuleAddress(first_capsule_date, luis.publicKey, program.programId);

      const letter_content = "Hello from the past again!";
      let should_fail;

      await addDummyLetters(
        program,
        luis,
        capsule_pkey,
        program.programId
      );

      try {
        const [letter_pkey, letter_bump] = getLetterAddress(capsule_pkey, letter_content, fernando.publicKey, program.programId);
        await program.methods.createLetter(letter_content).accounts({
          letter: letter_pkey,
          letterAuthor: fernando.publicKey,
          capsule: capsule_pkey,
          systemProgram:  anchor.web3.SystemProgram.programId
        }).signers([fernando]).rpc({commitment: "confirmed"});
      } catch (error) {
        const err = anchor.AnchorError.parse(error.logs);
        assert.strictEqual(err.error.errorCode.code, "MaximumLetterReached");
        should_fail = "Failed"
      }
      assert.strictEqual(should_fail, "Failed");
    });

    it("Fernando was sad he couldnt add letter to luis capsule, then he created his own and called his friends to add letters", async () => {
      await airdrop(provider.connection, isabelle.publicKey);
      await airdrop(provider.connection, geci.publicKey);
      await airdrop(provider.connection, gump.publicKey);

      const [isabelle_letter, geci_letter, gump_letter] = ["Hello from Isabelle", "Hello from Geci", "Hello from Gump"];

      const [capsule_pkey, capsule_bump] = getCapsuleAddress(second_capsule_Date, fernando.publicKey, program.programId);

      const [isabelle_letter_pkey, isabelle_letter_bump] = getLetterAddress(capsule_pkey, isabelle_letter, isabelle.publicKey, program.programId);      
      const [geci_letter_pkey, geci_letter_bump] = getLetterAddress(capsule_pkey, geci_letter, geci.publicKey, program.programId);      
      const [gump_letter_pkey, gump_letter_bump] = getLetterAddress(capsule_pkey, gump_letter, gump.publicKey, program.programId);

      await program.methods.createLetter(isabelle_letter).accounts({
        letter: isabelle_letter_pkey,
        letterAuthor: isabelle.publicKey,
        capsule: capsule_pkey,
        systemProgram: anchor.web3.SystemProgram.programId
      }).signers([isabelle]).rpc({commitment: "confirmed"});
      // await checkLetter(
      //   program,
      //   letter_pkey,
      //   capsule_pkey,
      //   fernando.publicKey,
      //   letter_content
      // );
      checkLetter(
        program,
        isabelle_letter_pkey,
        capsule_pkey,
        isabelle.publicKey,
        isabelle_letter
      );
      await program.methods.createLetter(geci_letter).accounts({
        letter: geci_letter_pkey,
        letterAuthor: geci.publicKey,
        capsule: capsule_pkey,
        systemProgram: anchor.web3.SystemProgram.programId
      }).signers([geci]).rpc({commitment: "confirmed"});
      checkLetter(
        program,
        geci_letter_pkey,
        capsule_pkey,
        geci.publicKey,
        geci_letter
      );
      
      await program.methods.createLetter(gump_letter).accounts({
        letter: gump_letter_pkey,
        letterAuthor: gump.publicKey,
        capsule: capsule_pkey,
        systemProgram: anchor.web3.SystemProgram.programId
      }).signers([gump]).rpc({commitment: "confirmed"});
      checkLetter(
        program,
        gump_letter_pkey,
        capsule_pkey,
        gump.publicKey,
        gump_letter
      );
      
    })
    it("Then fernando was trying to add a letter but he wrote too much as he was angry with luis :( then it fails", async () => {
      const fernando_letter_tmp = "Hey luis I hate your time capsule it does not fit my letter";
      const fernando_letter = fernando_letter_tmp.repeat(10);
      const [capsule_pkey, capsule_bump] = getCapsuleAddress(second_capsule_Date, fernando.publicKey, program.programId);
      const [fernando_letter_pkey, fernando_letter_bump] = getLetterAddress(capsule_pkey, fernando_letter, fernando.publicKey, program.programId);
      let failed = false;
      try {
        await program.methods.createLetter(fernando_letter).accounts({
          letter: fernando_letter_pkey,
          letterAuthor: fernando.publicKey,
          capsule: capsule_pkey,
          systemProgram: anchor.web3.SystemProgram.programId
        }).signers([fernando]).rpc({commitment: "confirmed"});
      } catch (error) {
        const err = anchor.AnchorError.parse(error.logs);
        assert.strictEqual(err.error.errorCode.code, "LetterTooLong");
        failed = true
      }
      assert.strictEqual(failed, true);
    })
  });
});

async function airdrop(connection: any, address: any, amount = 1000000000) {
  
  await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}

function getCapsuleAddress(openDate: string, author: PublicKey, programID: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode(openDate),
      anchor.utils.bytes.utf8.encode(CAPSULE_SEED),
      author.toBuffer()
    ],
    programID
  )
}

function getLetterAddress(capsule: PublicKey, letter_content: string, author: PublicKey, programID: PublicKey) {
  const hexString = crypto.createHash('sha256').update(letter_content, 'utf-8').digest('hex');
  const content_seed = Uint8Array.from(Buffer.from(hexString, 'hex'));
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode(LETTER_SEED),
      author.toBuffer(),
      content_seed,
      capsule.toBuffer()
    ],
    programID
  )
}

function stringToUtf8ByteArray(inputString: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(inputString);
}

function padByteArrayWithZeroes(byteArray: Uint8Array, length: number): Uint8Array {
  if (byteArray.length >= length) {
    return byteArray;
  }

  const paddedArray = new Uint8Array(length);
  paddedArray.set(byteArray, 0);
  return paddedArray;
}

async function checkCapsule(
  program: anchor.Program<TimemachineDapp>,
  capsule: PublicKey,
  capsule_author?: PublicKey,
  open_date?: string,
  letter_count?: number,
) {
  let capsule_data = await program.account.capsule.fetch(capsule);

  if (capsule_author) assert.strictEqual(capsule_data.capsuleAuthor.toString(), capsule_author.toString());

  if (open_date) {
    const utf8ByteArray_open_date = stringToUtf8ByteArray(open_date);
    const paddedByteArray_open_date = padByteArrayWithZeroes(utf8ByteArray_open_date, 10);
    assert.strictEqual(capsule_data.openDate.toString(), paddedByteArray_open_date.toString());
  }

  if (letter_count) {
    assert.strictEqual(capsule_data.letterCount.toString(), new BN(letter_count).toString());
  }

}

async function checkLetter(
  program: anchor.Program<TimemachineDapp>,
  letter: PublicKey,
  capsule?: PublicKey,
  letter_author?: PublicKey,
  letter_content?: string,
  bump?: number
) {
  let letter_data = await program.account.letter.fetch(letter);
  
  if (letter_author) assert.strictEqual(letter_data.letterAuthor.toString(), letter_author.toString());
  
  if (capsule){ 
    assert.strictEqual(letter_data.capsule.toString(), capsule.toString());
  }

  if (letter_content) {
    const utf8ByteArray_content = stringToUtf8ByteArray(letter_content);
    const paddedByteArray_content = padByteArrayWithZeroes(utf8ByteArray_content, 500);
    assert.strictEqual(letter_data.content.toString(), paddedByteArray_content.toString());
  }
}

async function addDummyLetters(
  program: anchor.Program<TimemachineDapp>,
  author: anchor.web3.Keypair,
  capsule: PublicKey,
  programId: PublicKey
) {

  const [letter_1_pkey, letter_1_bump] = getLetterAddress(capsule, "Letter 1", author.publicKey, programId);
  const [letter_2_pkey, letter_2_bump] = getLetterAddress(capsule, "Letter 2", author.publicKey, programId);
  const [letter_3_pkey, letter_3_bump] = getLetterAddress(capsule, "Letter 3", author.publicKey, programId);
  const [letter_4_pkey, letter_4_bump] = getLetterAddress(capsule, "Letter 4", author.publicKey, programId);
  const [letter_5_pkey, letter_5_bump] = getLetterAddress(capsule, "Letter 5", author.publicKey, programId);
  const [letter_6_pkey, letter_6_bump] = getLetterAddress(capsule, "Letter 6", author.publicKey, programId);
  const [letter_7_pkey, letter_7_bump] = getLetterAddress(capsule, "Letter 7", author.publicKey, programId);
  const [letter_8_pkey, letter_8_bump] = getLetterAddress(capsule, "Letter 8", author.publicKey, programId);
  const [letter_9_pkey, letter_9_bump] = getLetterAddress(capsule, "Letter 9", author.publicKey, programId);
  const [letter_10_pkey, letter_10_bump] = getLetterAddress(capsule, "Letter 10", author.publicKey, programId);

  await program.methods.createLetter("Letter 1").accounts({
    letter: letter_1_pkey,
    letterAuthor: author.publicKey,
    capsule,
    systemProgram: anchor.web3.SystemProgram.programId
  }).signers([author]).rpc({commitment: "confirmed"});
  await program.methods.createLetter("Letter 2").accounts({
    letter: letter_2_pkey,
    letterAuthor: author.publicKey,
    capsule,
    systemProgram: anchor.web3.SystemProgram.programId
  }).signers([author]).rpc({commitment: "confirmed"});
  await program.methods.createLetter("Letter 3").accounts({
    letter: letter_3_pkey,
    letterAuthor: author.publicKey,
    capsule,
    systemProgram: anchor.web3.SystemProgram.programId
  }).signers([author]).rpc({commitment: "confirmed"});
  await program.methods.createLetter("Letter 4").accounts({
    letter: letter_4_pkey,
    letterAuthor: author.publicKey,
    capsule,
    systemProgram: anchor.web3.SystemProgram.programId
  }).signers([author]).rpc({commitment: "confirmed"});
  await program.methods.createLetter("Letter 5").accounts({
    letter: letter_5_pkey,
    letterAuthor: author.publicKey,
    capsule,
    systemProgram: anchor.web3.SystemProgram.programId
  }).signers([author]).rpc({commitment: "confirmed"});
  await program.methods.createLetter("Letter 6").accounts({
    letter: letter_6_pkey,
    letterAuthor: author.publicKey,
    capsule,
    systemProgram: anchor.web3.SystemProgram.programId
  }).signers([author]).rpc({commitment: "confirmed"});
  await program.methods.createLetter("Letter 7").accounts({
    letter: letter_7_pkey,
    letterAuthor: author.publicKey,
    capsule,
    systemProgram: anchor.web3.SystemProgram.programId
  }).signers([author]).rpc({commitment: "confirmed"});
  await program.methods.createLetter("Letter 8").accounts({
    letter: letter_8_pkey,
    letterAuthor: author.publicKey,
    capsule,
    systemProgram: anchor.web3.SystemProgram.programId
  }).signers([author]).rpc({commitment: "confirmed"});
  await program.methods.createLetter("Letter 9").accounts({
    letter: letter_9_pkey,
    letterAuthor: author.publicKey,
    capsule,
    systemProgram: anchor.web3.SystemProgram.programId
  }).signers([author]).rpc({commitment: "confirmed"});
}