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
import Slots from './Slots';

class Slideshow extends Component {

  constructor(props) {
    super(props);
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
    if(data == 'spin') {
       data = <Slots />;
    }
    this.setState({activeCard: data});
  }


  setSlides(slides) {
    this.setState({slides: slides});
  }

  render() {

       return (
              <div>Hi<QRCode value={"testing"} /></div>
       );
  }
}

export default Slideshow;
