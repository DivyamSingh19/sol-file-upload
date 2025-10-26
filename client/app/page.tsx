'use client'
import { useWeb3 } from '@/context/Web3Context'
import { Spinner } from 'react-bootstrap'
import Home from '@/components/Home'

export default function HomePage() {
  const { loading, marketplace, nft } = useWeb3()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spinner animation="border" style={{ display: 'flex' }} />
        <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
      </div>
    )
  }

  return <Home marketplace={marketplace} nft={nft} />
}