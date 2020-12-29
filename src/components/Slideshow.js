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
	slides: props.slides
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

  setSlides(slides) {
    this.setState({slides: slides});
	  console.log(slides);
  }

  render() {

   var slides = this.state.slides;
   if(slides != null) {
       const slides = this.state.slides;

       return (
          <Slider>
            {slides.map((slide, index) => <div key={index}>
              <h2>{slide.gameId}</h2>
              <div>{slide.word}</div>
            </div>)}
          </Slider>
       );
    }
  }
}

export default Slideshow;
