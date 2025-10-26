/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { ethers, Contract, BigNumber } from 'ethers'
import { Row, Col, Card } from 'react-bootstrap'

interface ItemMetadata {
  name: string
  description: string
  image: string
}

interface ListedItem {
  totalPrice: BigNumber
  price: BigNumber
  itemId: BigNumber
  name: string
  description: string
  image: string
}

interface ContractItem {
  seller: string
  tokenId: BigNumber
  itemId: BigNumber
  price: BigNumber
  sold: boolean
}

interface MyListedItemsProps {
  marketplace: Contract | null
  nft: Contract | null
  account: string | null
}

function renderSoldItems(items: ListedItem[]) {
  return (
    <>
      <h2>Sold</h2>
      <Row xs={1} md={2} lg={4} className="g-4 py-3">
        {items.map((item, idx) => (
          <Col key={idx} className="overflow-hidden">
            <Card>
              <Card.Img variant="top" src={item.image} alt={item.name} />
              <Card.Footer>
                For {ethers.utils.formatEther(item.totalPrice)} ETH - Received {ethers.utils.formatEther(item.price)} ETH
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}

export default function MyListedItems({ marketplace, nft, account }: MyListedItemsProps) {
  const [loading, setLoading] = useState(true)
  const [listedItems, setListedItems] = useState<ListedItem[]>([])
  const [soldItems, setSoldItems] = useState<ListedItem[]>([])

  const loadListedItems = async () => {
    if (!marketplace || !nft || !account) {
      setLoading(false)
      return
    }

    try {
      // Load all sold items that the user listed
      const itemCount: BigNumber = await marketplace.itemCount()
      const listedItems: ListedItem[] = []
      const soldItems: ListedItem[] = []

      for (let indx = 1; indx <= itemCount.toNumber(); indx++) {
        const i: ContractItem = await marketplace.items(indx)
        
        if (i.seller.toLowerCase() === account.toLowerCase()) {
          // get uri url from nft contract
          const uri: string = await nft.tokenURI(i.tokenId)
          
          // use uri to fetch the nft metadata stored on ipfs 
          const response = await fetch(uri)
          const metadata: ItemMetadata = await response.json()
          
          // get total price of item (item price + fee)
          const totalPrice: BigNumber = await marketplace.getTotalPrice(i.itemId)
          
          // define listed item object
          const item: ListedItem = {
            totalPrice,
            price: i.price,
            itemId: i.itemId,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image
          }
          
          listedItems.push(item)
          
          // Add listed item to sold items array if sold
          if (i.sold) soldItems.push(item)
        }
      }
      
      setListedItems(listedItems)
      setSoldItems(soldItems)
    } catch (error) {
      console.error('Error loading listed items:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadListedItems()
  }, [marketplace, nft, account])

  if (loading) {
    return (
      <main style={{ padding: '1rem 0' }}>
        <h2>Loading...</h2>
      </main>
    )
  }

  return (
    <div className="flex justify-center">
      {listedItems.length > 0 ? (
        <div className="px-5 py-3 container">
          <h2>Listed</h2>
          <Row xs={1} md={2} lg={4} className="g-4 py-3">
            {listedItems.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} alt={item.name} />
                  <Card.Footer>
                    {ethers.utils.formatEther(item.totalPrice)} ETH
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
          {soldItems.length > 0 && renderSoldItems(soldItems)}
        </div>
      ) : (
        <main style={{ padding: '1rem 0' }}>
          <h2>No listed assets</h2>
        </main>
      )}
    </div>
  )
}