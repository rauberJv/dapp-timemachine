
import { FC } from "react";
import { Capsule } from '../../components/Capsule';
import { SendTransaction } from '../../components/SendTransaction';
import { SendVersionedTransaction } from '../../components/SendVersionedTransaction';
import {useWallet} from "@solana/wallet-adapter-react";

export const BasicsView: FC = ({ }) => {
  const wallet = useWallet();
  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className={`text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mt-10 mb-8 ${wallet.publicKey ? '' : 'animate-pulse'}`}>
          {wallet.publicKey ? 'Timemachine Capsule Operator' : 'Connect your Wallet ;)'}
        </h1>
        {/* CONTENT GOES HERE */}
        <div className="w-full">
          <Capsule />
        </div>
      </div>
    </div>
  );
};
