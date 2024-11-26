// TODO: SignMessage
import { verify } from '@noble/ed25519';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { FC, useCallback, useState } from 'react';
import { notify } from "../utils/notifications";
import { Program, AnchorProvider, web3, utils, BN, setProvider, AnchorError } from '@coral-xyz/anchor';
import idl from "./timemachine_dapp.json"
import { TimemachineDapp } from './timemachine_dapp';
import { PublicKey } from '@solana/web3.js';
import crypto from 'crypto'

const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);

export const Capsule: FC = () => {
    const wallet = useWallet();
    const { connection } = useConnection();
    const [capsules, setCapsules] = useState([])
    const [capsuleOpenDate, setCapsuleOpenDate] = useState('')
    const [selectedCapsule, setSelectedCapsule] = useState(null);
    const [selectedCapsuleDate, setSelectedCapsuleDate] = useState(null);
    const [letterContent, setLetterContent] = useState('');

    const getProvider = () => {
        const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
        setProvider(provider)
        return provider;
    }

    const initialize = async () => {
        try {
            const anchProvider = getProvider();
            const program = new Program<TimemachineDapp>(idl_object, anchProvider)

            if (!/^\d{2}-\d{2}-\d{4}$/.test(capsuleOpenDate)) {
                notify({
                    message: "The capsule date should be in format DD-MM-YYYY",
                    type: 'error'
                });
            } else {
                await program.methods.initialize(capsuleOpenDate).accounts({
                    capsuleAuthority: anchProvider.publicKey
                }).rpc({})
                notify({
                    message: `Capsule created for ${capsuleOpenDate}`,
                    type: "success"
                })
            }
        } catch (error) {
            notify({
                message: `Error creating capsule, try another date.`,
                type: 'error'
            })
        }
    }
    
    const fetchCapsules = async () => {
        try {
            const anchProvider = getProvider();
            const program = new Program<TimemachineDapp>(idl_object, anchProvider)

            Promise.all((await connection.getParsedProgramAccounts(program.programId, {
                filters: [
                    {
                        dataSize: 52
                    }
                ]
            }))
            .filter(account => account.account.owner.toBase58() === program.programId.toBase58())
            .map(async local_capsule => {
                try {
                    return {
                        ...(await program.account.capsule.fetch(local_capsule.pubkey)),
                        pubkey: local_capsule.pubkey
                    }
                } catch (error) {
                    console.error(error)
                    return null
                }
            })).then(capsules => {
                setCapsules(capsules)
            }).catch(error => {
                console.error(error)
            })

        } catch (error) {
            console.error(error);
        }
    }

    const sendLetter = async () => {
        try {
            const anchProvider = getProvider();
            const program = new Program<TimemachineDapp>(idl_object, anchProvider)

            const hexString = crypto.createHash('sha256').update(letterContent, 'utf-8').digest('hex');
            const content_seed = Uint8Array.from(Buffer.from(hexString, 'hex'));
            const selected_capsule_author = new PublicKey(selectedCapsule.capsuleAuthor);
            const [capsulePDA, capsuleBump] = await PublicKey.findProgramAddressSync([
                utils.bytes.utf8.encode(selectedCapsuleDate),
                utils.bytes.utf8.encode("CAPSULE_SEED"),
                selected_capsule_author.toBuffer()
            ],
            program.programId);

            const [letterPDA, letterBump] = await PublicKey.findProgramAddressSync([
                utils.bytes.utf8.encode("LETTER_SEED"),
                anchProvider.publicKey.toBuffer(),
                content_seed,
                capsulePDA.toBuffer()
            ],
            program.programId
            );

            await program.methods.createLetter(letterContent).accounts(
                {
                    letter: letterPDA,
                    letterAuthor: anchProvider.publicKey,
                    capsule: capsulePDA,
                }
            ).rpc({})
            fetchCapsules();
            setSelectedCapsule({
                ...selectedCapsule,
                letterCount: selectedCapsule.letterCount + 1
            })
            notify({
                message: "Your letter was sent to capsule successfully",
                type: 'success'
            })
        } catch (error) {
            if (error instanceof AnchorError) {
                notify({
                    message: `${error.error.errorMessage}`,
                    type: 'error'
                })
            } else {
                console.log(error)
                notify({
                    message: 'Error sending your letter to machine.',
                    type: 'error'
                })
            }
        }
    } 

    const handleChange = (event) => {
        setCapsuleOpenDate(event.target.value);
    }

    const handleChangeCapsule = (capsule) => {
        const open_date_original = capsule.openDate ? capsule.openDate : [];
        const open_date_converted = Buffer.from(open_date_original).toString("utf8");
        setSelectedCapsuleDate(open_date_converted)
        setSelectedCapsule(capsule);
    }

    const capsulesComponent = capsules.map(capsule => {
        if (capsule) {
            const open_date_original = capsule.openDate ? capsule.openDate : [];
            const open_date_converted = Buffer.from(open_date_original).toString("utf8")
            return <li key={capsule.pubkey}>
                <button onClick={() => handleChangeCapsule(capsule)} className='m-2 btn bg-gradient-to-br from-orange-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black'>Capsule {open_date_converted}</button>
            </li>
        }
    });

    const selectedCapsuleInfoComponent = () => {
        if (selectedCapsule) {
            const publicKey = new PublicKey(selectedCapsule.pubkey);
            const letterCount = selectedCapsule.letterCount;
            return <p className='text-center'>
                Selected Capsule {selectedCapsuleDate} <br />
                Letters in Capsule {letterCount}
            </p>
        } else {
            return <p className='text-center'>
                Fetch and Select a capsule to operate <br />Or create a new one.

            </p>
        }
    }

    return (
        <>
        {wallet.publicKey ? 
            <div className='w-full'>
                <div className="flex flex-col justify-center mx-auto w-6/12">
                    {selectedCapsuleInfoComponent()}
                </div>
                <br></br>
                <div className="flex flex-col align-items-center justify-content-center">
                    <div className='flex items-center'>
                        <input type="text" onChange={handleChange} value={capsuleOpenDate} placeholder="Capsule Date (DD-MM-YYYY)" className="input input-bordered w-full max-w-xs" />
                    <button
                        className="w-60 m-2 btn bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                        onClick={initialize}
                        disabled={!wallet.publicKey}
                        >
                        {!wallet.publicKey ? 
                        <div className="">
                            Wallet not connected
                        </div>
                        :
                        <span className="" > 
                            Create your Capsule
                        </span>
                        }
                    </button>
                    </div>
                    <div className='flex items-center '>
                <input type="text" onChange={(event) => setLetterContent(event.target.value)} value={letterContent} placeholder="Letter Content" className="input input-bordered w-full max-w-xs" />

                    <button
                            className="group w-60 m-2 btn bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                            onClick={sendLetter}
                            disabled={!selectedCapsule || !wallet.publicKey}
                        >
                        {!wallet.publicKey ? 
                        <div className="">
                            Wallet not connected
                        </div>
                        :
                        <span className=""> 
                            Send letter to Capsule
                        </span>
                        }
                        </button>
                    </div>
                    <button
                        className="w-60 m-2 btn bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                        onClick={fetchCapsules}
                        disabled={!wallet.publicKey}
                        >
                        {!wallet.publicKey ? 
                        <div className="">
                            Wallet not connected
                        </div>
                        :
                        <span className="" > 
                            Fetch Capsules
                        </span>
                        }
                    </button>
                </div>
                    <ul className='flex flex-wrap w-full min-w-full'>
                    {capsulesComponent}
                    </ul>
            </div>
            :
            ''
        }
        </>
    );
};
