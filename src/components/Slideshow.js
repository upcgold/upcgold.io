import React, { Component } from 'react'
import dai from '../dai.png'
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
//import loader from './infinity-loader.gif';
import loader from './infinity-loader2.gif';
import QRCode from "qrcode-react";
import Slider from 'react-animated-slider';
import 'react-animated-slider/build/horizontal.css';
import ReactCardFlip from 'react-card-flip';
import Trianglify from 'react-trianglify'

class Slideshow extends Component {

  constructor(props) {
    super(props);
    var slides = Array();
    this.state = {
	slides: props.slides,
        isFlipped: false,
        activeCard: 'front'
    }
    console.log("INNNNNN");
    console.log(props.slides[1]);
  }

  refreshPage() {
  }
 
  componentDidMount = async () => {
    var self = this;
    setInterval(function() {
        return self.refreshPage();
     }, 5000);
 
    return this.refreshPage();
  }

  flipCard = (data) => {
    this.setState({isFlipped: !this.state.isFlipped});
    this.setState({activeCard: data});
  }


  setSlides(slides) {
    this.setState({slides: slides});
  }

  render() {

   const web3 = window.web3;
   var slides = this.state.slides;
   if(slides != null) {
       const slides = this.state.slides;
//console.log(slides);
       return (
          <Slider previousButton={''} nextButton={''} duration={5}>
            {slides.map((slide, index) => <div style={{"textAlign": "center" }} key={index}>
            <ReactCardFlip style={{'height': '100vh'}} isFlipped={this.state.isFlipped} flipDirection="horizontal">
             <div>
              <div><QRCode value={JSON.stringify(slide.qrJson)} /></div>
              <div>UPC: {slide.word}</div>
              <div>Amount: {web3.utils.fromWei(slide.amountStaked, 'ether')} (xDAI)</div>
		<button
		   value={slide.word}
		   onClick={(word) => {this.props.unstakeTokens(word)} }
		   className="btn btn-warning btn-block btn-lg"
		>
		Release Chip
		</button>
		<button onClick={() => this.flipCard('spin')}
		   className="btn btn-primary btn-block btn-lg"
                >
			Coinbox Casino
		</button>
		<button onClick={() => this.flipCard('xp')}
		   className="btn btn-success btn-block btn-lg"
                >
                  Configure {slide.gameId}
		</button>
		<button onClick={() => this.flipCard('cm')}
		   className="btn btn-dark btn-block btn-lg"
                >
                  *crypto mode*
		</button>
              <h2>#{index+1}</h2>
             </div>
             <div>
		<button onClick={() => this.flipCard('front')}
		   className="btn btn-primary btn-block btn-lg"
                >
			Back
		</button>
		<h1>{this.state.activeCard}</h1>
             </div>
           </ReactCardFlip></div>)}
           
          </Slider>
       );
    }
  }
}

export default Slideshow;
