'use client'
import { useWeb3 } from '@/context/Web3Context'
import Create from '@/components/Create'

export default function CreatePage() {
  const { marketplace, nft } = useWeb3()
  return <Create marketplace={marketplace} nft={nft} />
}