import { useState, useCallback } from "react";
import { Contract, parseEther, formatEther } from "ethers";
import { useWallet } from "@/contexts/WalletContext";
import { STAKEFORGE_VAULT_ABI, ERC721_ABI } from "./abi";
import { getVaultAddress, IS_TESTNET } from "./config";
import { useToast } from "@/hooks/use-toast";

export type StakeMode = 0 | 1 | 2; // SOFT, HARD, FLEXIBLE

interface UseStakeForgeReturn {
  isReady: boolean;
  microFeeWei: bigint | null;
  stake: (poolId: number, tokenId: number, mode: StakeMode, customLockSeconds?: number) => Promise<string | null>;
  unstake: (nftContract: string, tokenId: number) => Promise<string | null>;
  approveNFT: (nftContract: string, tokenId: number) => Promise<boolean>;
  approveAllNFTs: (nftContract: string) => Promise<boolean>;
  getMicroFee: () => Promise<bigint>;
  isLoading: boolean;
  error: string | null;
}

export function useStakeForge(): UseStakeForgeReturn {
  const { signer, chainId, isConnected } = useWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [microFeeWei, setMicroFeeWei] = useState<bigint | null>(null);

  const vaultAddress = chainId ? getVaultAddress(chainId) : null;
  const isReady = isConnected && !!signer && !!vaultAddress;

  const getVault = useCallback(() => {
    if (!signer || !vaultAddress) throw new Error("Wallet not connected or contract not deployed on this chain");
    return new Contract(vaultAddress, STAKEFORGE_VAULT_ABI, signer);
  }, [signer, vaultAddress]);

  const getMicroFee = useCallback(async (): Promise<bigint> => {
    const vault = getVault();
    const fee = await vault.adminMicroFeeWei();
    setMicroFeeWei(fee);
    return fee;
  }, [getVault]);

  const approveNFT = useCallback(async (nftContract: string, tokenId: number): Promise<boolean> => {
    if (!signer || !vaultAddress) return false;
    setIsLoading(true);
    setError(null);
    try {
      const nft = new Contract(nftContract, ERC721_ABI, signer);
      const tx = await nft.approve(vaultAddress, tokenId);
      toast({ title: "⏳ Approving NFT...", description: `Tx: ${tx.hash.slice(0, 10)}...` });
      await tx.wait();
      toast({ title: "✅ NFT Approved", description: "You can now stake this NFT." });
      return true;
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Approval Failed", description: err.reason || err.message, variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [signer, vaultAddress, toast]);

  const approveAllNFTs = useCallback(async (nftContract: string): Promise<boolean> => {
    if (!signer || !vaultAddress) return false;
    setIsLoading(true);
    setError(null);
    try {
      const nft = new Contract(nftContract, ERC721_ABI, signer);
      const tx = await nft.setApprovalForAll(vaultAddress, true);
      toast({ title: "⏳ Approving collection...", description: `Tx: ${tx.hash.slice(0, 10)}...` });
      await tx.wait();
      toast({ title: "✅ Collection Approved", description: "All NFTs in this collection can now be staked." });
      return true;
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Approval Failed", description: err.reason || err.message, variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [signer, vaultAddress, toast]);

  const stake = useCallback(async (
    poolId: number,
    tokenId: number,
    mode: StakeMode,
    customLockSeconds: number = 0
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const vault = getVault();
      const fee = await vault.adminMicroFeeWei();
      setMicroFeeWei(fee);

      toast({ title: "⏳ Staking NFT...", description: `Sending transaction with ${formatEther(fee)} ETH micro-fee...` });

      const tx = await vault.stake(poolId, tokenId, mode, customLockSeconds, {
        value: fee,
      });

      toast({ title: "⏳ Confirming...", description: `Tx: ${tx.hash.slice(0, 10)}...` });
      const receipt = await tx.wait();

      toast({ title: "🎉 NFT Staked!", description: `Successfully staked token #${tokenId}` });
      return receipt.hash;
    } catch (err: any) {
      const msg = err.reason || err.message || "Transaction failed";
      setError(msg);
      toast({ title: "Staking Failed", description: msg, variant: "destructive" });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getVault, toast]);

  const unstake = useCallback(async (
    nftContract: string,
    tokenId: number
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const vault = getVault();
      const fee = await vault.adminMicroFeeWei();

      toast({ title: "⏳ Unstaking NFT...", description: `Sending transaction...` });

      const tx = await vault.unstake(nftContract, tokenId, { value: fee });
      const receipt = await tx.wait();

      toast({ title: "🎉 NFT Unstaked!", description: `Token #${tokenId} returned to your wallet.` });
      return receipt.hash;
    } catch (err: any) {
      const msg = err.reason || err.message || "Transaction failed";
      setError(msg);
      toast({ title: "Unstaking Failed", description: msg, variant: "destructive" });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getVault, toast]);

  return {
    isReady,
    microFeeWei,
    stake,
    unstake,
    approveNFT,
    approveAllNFTs,
    getMicroFee,
    isLoading,
    error,
  };
}
