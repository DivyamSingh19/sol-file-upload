//@ts-nocheck
'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ethers, Contract } from 'ethers'
import MarketplaceAbi from '@/contractsData/Marketplace.json'
import MarketplaceAddress from '@/contractsData/Marketplace-address.json'
import NFTAbi from '@/contractsData/NFT.json'
import NFTAddress from '@/contractsData/NFT-address.json'

interface Web3ContextType {
  loading: boolean
  account: string | null
  nft: Contract | null
  marketplace: Contract | null
  web3Handler: () => Promise<void>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function useWeb3(): Web3ContextType {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider')
  }
  return context
}

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState<string | null>(null)
  const [nft, setNFT] = useState<Contract | null>(null)
  const [marketplace, setMarketplace] = useState<Contract | null>(null)

  const loadContracts = async (signer: ethers.Signer) => {
    try {
      const marketplace = new ethers.Contract(
        MarketplaceAddress.address,
        MarketplaceAbi.abi,
        signer
      )
      setMarketplace(marketplace)

      const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer)
      setNFT(nft)
      setLoading(false)
    } catch (err) {
      console.error('Error loading contracts:', err)
      setLoading(false)
    }
  }

  const web3Handler = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask!')
        return
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[]
      setAccount(accounts[0])

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      await loadContracts(signer)
    } catch (err) {
      console.error('Wallet connection failed:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      // Check if already connected
      window.ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            web3Handler()
          } else {
            setLoading(false)
          }
        })
        .catch(() => setLoading(false))

      // Listen for chain changes
      const handleChainChanged = () => {
        window.location.reload()
      }

      // Listen for account changes
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          web3Handler()
        } else {
          setAccount(null)
          setMarketplace(null)
          setNFT(null)
        }
      }

      window.ethereum.on('chainChanged', handleChainChanged)
      window.ethereum.on('accountsChanged', handleAccountsChanged)

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('chainChanged', handleChainChanged)
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        }
      }
    } else {
      setLoading(false)
    }
  }, [])

     return (
    <Web3Context.Provider
      value={{
        loading,
        account,
        nft,
        marketplace,
        web3Handler,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}
