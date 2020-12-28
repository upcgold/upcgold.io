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
    super(props)
    let scannables;
      this.state = {
        scannables: '0',
	scannableStats: [],
	scannableRewards: [],
	cardsLoading: true,
        flipped: [],
	loadingGif: <img src={loader} alt="loading..." />
       }
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

  render() {

    const slides = [
      { title: 'First item', description: 'Lorem ipsum'},
      { title: 'Second item', description: 'Lorem ipsum'}
    ];


    return (
       <Slider>
         {slides.map((slide, index) => <div key={index}>
           <h2>{slide.title}</h2>
           <div>{slide.description}</div>
         </div>)}
       </Slider>
    );
  }
}

export default Slideshow;
