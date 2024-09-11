import { Frog, Button } from 'frog'
import { handle } from 'frog/next'
import axios from 'axios'

const app = new Frog({
  basePath: '/api',
  title: 'Music NFT Viewer',
})

const MUSIC_NFT_ADDRESS = '0x2953399124F0cBB46d2CbACD8A89cF0599974963'
const MUSIC_NFT_TOKEN_ID = '48322449810511513307546497526911080636141810138909813052644406601835649957889'
const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY || 'eb90d151ee88429eac31c3b6cac0aa2e'
const OPENSEA_API_URL = 'https://api.opensea.io/api/v1'

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  external_url?: string;
  attributes: { trait_type: string; value: string }[];
}

async function getMusicNFTMetadata(): Promise<NFTMetadata | null> {
  const url = `${OPENSEA_API_URL}/asset/${MUSIC_NFT_ADDRESS}/${MUSIC_NFT_TOKEN_ID}/`
  
  try {
    const response = await axios.get(url, {
      headers: {
        'X-API-KEY': OPENSEA_API_KEY
      }
    })
    
    const data = response.data
    return {
      name: data.name,
      description: data.description,
      image: data.image_url,
      animation_url: data.animation_url,
      external_url: data.permalink,
      attributes: data.traits.map((trait: any) => ({
        trait_type: trait.trait_type,
        value: trait.value,
      })),
    }
  } catch (error) {
    console.error('Error fetching Music NFT from OpenSea:', error)
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
      intents.push(<Button action={`link:${nftMetadata.external_url}`}>View on OpenSea</Button>);
    }

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