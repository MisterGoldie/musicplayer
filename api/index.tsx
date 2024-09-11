import { Frog, Button } from 'frog'
import { handle } from 'frog/next'
import axios from 'axios'

const app = new Frog({
  basePath: '/api',
  title: 'Music NFT Viewer',
})

const MUSIC_NFT_ADDRESS = '0x2953399124F0cBB46d2CbACD8A89cF0599974963'
const MUSIC_NFT_TOKEN_ID = '48322449810511513307546497526911080636141810138909813052644406601835649957889'
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || 'pe-VGWmYoLZ0RjSXwviVMNIDLGwgfkao'
const ALCHEMY_API_URL = 'https://polygon-mainnet.g.alchemy.com/v2/'

// Replace this with your actual frame URL
const FRAME_URL = 'https://musicplayer-gamma-five.vercel.app/api'

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  external_url?: string;
  attributes: { trait_type: string; value: string }[];
}

async function getMusicNFTMetadata(): Promise<NFTMetadata | null> {
  const url = `${ALCHEMY_API_URL}${ALCHEMY_API_KEY}/getNFTMetadata`
  const params = {
    contractAddress: MUSIC_NFT_ADDRESS,
    tokenId: MUSIC_NFT_TOKEN_ID,
    tokenType: 'erc1155'
  }

  try {
    const response = await axios.get(url, { params })
    return response.data.metadata
  } catch (error) {
    console.error('Error fetching Music NFT:', error)
    return null
  }
}

app.frame('/', async (c) => {
  const { buttonValue } = c;
  console.log('Button value:', buttonValue);

  if (buttonValue === 'view_nft') {
    const nftMetadata = await getMusicNFTMetadata();

    if (!nftMetadata) {
      return c.res({
        image: (
          <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#000000' }}>
            <p>Error fetching NFT metadata</p>
          </div>
        ),
        intents: [
          <Button value="home">Back</Button>
        ],
      })
    }

    const intents = [
      <Button value="home">Back</Button>
    ];

    if (nftMetadata.animation_url) {
      intents.push(<Button action={`link:${nftMetadata.animation_url}`}>Play Music</Button>);
    }

    if (nftMetadata.external_url) {
      intents.push(<Button action={`link:${nftMetadata.external_url}`}>View on Marketplace</Button>);
    }

    // Add Share button with external link
    const shareUrl = `https://warpcast.com/~/compose?text=Check out this Music NFT!&embeds[]=${encodeURIComponent(FRAME_URL)}`;
    intents.push(<Button action={`link:${shareUrl}`}>Share</Button>);

    return c.res({
      image: (
        <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#000000' }}>
          <img
            src={nftMetadata.image}
            alt="NFT"
            style={{ width: '300px', height: '300px', objectFit: 'contain', borderRadius: '5px' }}
          />
          <p>{nftMetadata.name}</p>
          <p style={{ fontSize: '16px', marginTop: '10px', textAlign: 'center' }}>{nftMetadata.description}</p>
        </div>
      ),
      intents: intents,
    })
  }

  // Default view (home)
  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#000000' }}>
        <p>Welcome to Music NFT Viewer</p>
      </div>
    ),
    intents: [
      <Button value="view_nft">View Music NFT</Button>
    ],
  })
})

export const GET = handle(app)
export const POST = handle(app)