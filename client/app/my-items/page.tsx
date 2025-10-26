'use client'
import { useWeb3 } from '@/context/web3Context'
import MyListedItems from '@/components/MyListedItems'

export default function MyListedItemsPage() {
  const { marketplace, nft, account } = useWeb3()
  return <MyListedItems marketplace={marketplace} nft={nft} account={account} />
}