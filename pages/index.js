import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [ownerAddress, setOwnerAddress] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(1);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts[0]);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected:", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts[0]);

    getATMContract();
    getOwnerAddress();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const getOwnerAddress = async () => {
    if (atm) {
      const ownerAddr = await atm.getOwnerAddress();
      setOwnerAddress(ownerAddr);
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    }
  };

  const transfer = async () => {
    if (atm) {
      if (!recipient || !amount) {
        console.error("Recipient address and amount are required for transfer.");
        return;
      }

      let tx = await atm.transfer(recipient, amount);
      await tx.wait();
      getBalance();
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your Metamask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }
  

    return (
      <div>
        <p>contractAddress: {contractAddress}</p>
        <p>Owner Address: {ownerAddress}</p>
          <button onClick={getOwnerAddress}>Get Owner Address</button>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <div>
          <label>Recipient Address: </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <br />
          <label>Transfer Amount: </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={transfer}>Transfer</button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
          .container {
            text-align: center;
          }
        `}</style>
    </main>
  );
}
