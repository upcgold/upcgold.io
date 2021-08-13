import React, { Component, useState, useEffect } from 'react'
import uuid from 'react-uuid';
import ScratchCard from 'react-scratchcard';
import ReactCardFlip from 'react-card-flip';
import Ticker from 'react-ticker'
import Image1 from './extra/img-1.jpg'
import Image2 from './extra/img-2.jpg'
import Image3 from './extra/img-3.jpg'
import Image4 from './extra/img-4.jpg'
import QRCode from "react-qr-code";


function rand(min, max) {
  var offset = min
  var range = (max - min) + 1
  var randomNumber = Math.floor(Math.random() * range) + offset
  return randomNumber
}

const quotes = [
  '“We are convinced that liberty without socialism is privilege, injustice; and that socialism without liberty is slavery and brutality.”',
  '“Private capital tends to become concentrated in few hands, partly because of competition among the capitalists, and partly because technological development and the increasing division of labor encourage the formation of larger units of production at the expense of smaller ones. The result of these developments is an oligarchy of private capital the enormous power of which cannot be effectively checked even by a democratically organized political society. This is true since the members of legislative bodies are selected by political parties, largely financed or otherwise influenced by private capitalists who, for all practical purposes, separate the electorate from the legislature. The consequence is that the representatives of the people do not in fact sufficiently protect the interests of the underprivileged sections of the population. Moreover, under existing conditions, private capitalists inevitably control, directly or indirectly, the main sources of information (press, radio, education). It is thus extremely difficult, and indeed in most cases quite impossible, for the individual citizen to come to objective conclusions and to make intelligent use of his political rights.”',
  '“Freedom is always the freedom of the dissenter.”',
  '“Civil government, so far as it is instituted for the security of property, is in reality instituted for the defense of the rich against the poor, or of those who have some property against those who have none at all.”',
  '“For the recognition of private property has really harmed Individualism, and obscured it, by confusing a man with what he possesses.”',
  '“Everyone should be able to attend to his religious as well as his bodily needs without the police sticking their nose in.”',
  '“Philosophers have hitherto interpreted the world in various ways; the point, however, is to change it.”',
  '“Money is the alienated essence of man’s labor and life; and this alien essence dominates him as he worships it.',
]
const names = [
  'Captain Ahab',
  'Ishmael',
  'Moby Dick',
  'Ashore',
  'Tashtego',
  'Pip (The cabin boy)',
  'The Manxman',
  'Dough Boy',
  'Derick de Deer',
]

const images = [Image1, Image2, Image3, Image4]

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}



function apiCall() {
  const number = rand(0, 3)
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(number)
    }, 500)
  })
}

const getImageFromApi = async (index) => {
  const img = await apiCall()
  return img
}

const ImageFromApi = () => {
  const [color] = useState(getRandomColor())
  const [image, setImage] = useState('')
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    getImageFromApi().then(image => {
      setImage(images[image])
      const img = new Image()
      img.onload = () => {
        setLoaded(true)
      }
      img.src = images[image]
    })
  }, [])

  return (
    <div
      style={{
        width: '25vw',
        height: '200px',
        background: color
      }}
    >
      <img
        src={image}
        className={loaded ? "loaded" : ""}
        style={{ height: '200px' }}
        alt=""
      />
    </div>
  )
}

const getTextFromApi = async (index) => {
  const text = await apiCall()
  return text
}

const TextFromApi = () => {
  const [text, setText] = useState('')
  useEffect(() => {
    getTextFromApi().then(text => {
      setText(names[text])
    })
  }, [])

  return text
    ? <h1>{text}</h1>
    : <h1>Placeholder</h1>
}


export default class MyTicker extends Component {
  state = {
    move: true,
    image: [],
    cgApi: ''
  }
  onClick = () => {
    this.setState(prevState => ({
      move: !prevState.move
    }))
  }

  flipCard = () => {
    this.setState({isFlipped: !this.state.isFlipped});
  }


  constructor(props) {
    super(props)
    this.state = {
      isFlipped: false
    }
  }

  getPriceData = async () => {
    const CoinGecko = require('coingecko-api');
    const CoinGeckoClient = new CoinGecko();
    let data = await CoinGeckoClient.ping();
    console.log(data);
  }

  render() {
    return (
      <div>

        <button onClick={this.getPriceData}
           className="btn btn-dark btn-block btn-lg"
        >
          Get Data
        </button>


        <Ticker
          speed={2}
          move={this.state.move}
          height={200}
        >
          {({ index }) => index === 0
            ? <h2 style={{ width: '25vw' }}>Crack the eggs to possibly find crypto!</h2>
            : 
         <div onClick={() => alert("hi")} style={{"marginRight":"10px"}} >
	    <QRCode size={128} value={uuid()} />
         </div>
          }
        </Ticker>

        <Ticker
          style={{"size":"12em"}}
          direction="toRight"
          offset="100%"
          speed={10}
          move={this.state.move}
        >
          {(index) => (
            <h1>React-Ticker</h1>
          )}
        </Ticker>
	    
      </div >
    )
  }
}
