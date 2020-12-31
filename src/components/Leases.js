import React, { Component } from 'react'
import dai from '../dai.png'
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
//import loader from './infinity-loader.gif';
import loader from './infinity-loader2.gif';
import Slideshow from './Slideshow';
import Slides from './Slides';
import QRCode from "qrcode-react";
import Slider from 'react-animated-slider';
import 'react-animated-slider/build/horizontal.css';
import ReactCardFlip from 'react-card-flip';
import Trianglify from 'react-trianglify'
import { makeAutoObservable } from "mobx"
import { observer } from "mobx-react-lite"

const CHECKSUM = "42ggI^&G6gyg&^tjf5r32k;ioloJKGYUy456%$$YY4<F5>%$^Ey";

class Main extends Component {

  constructor(props) {
    super(props)
    let scannables;
    var show = new Slides();
    const showObs = observer(show);

      this.state = {
        scannables: '0',
        sliderKey: 0,
	scannableStats: [],
	scannableRewards: [],
	cardsLoading: true,
        flipped: [],
	slideshow: null,
	slides: Array(),
	loadingGif: <img src={loader} alt="loading..." />
       }
    this.loadLeasePage = this.loadLeasePage.bind(this);
    this.getScannables = this.getScannables.bind(this);
    this.getScannable = this.getScannable.bind(this);
    this.flipCard= this.flipCard.bind(this);

  }

 
  componentDidMount = async () => {
    var self = this;
    setInterval(function() {
        return self.loadLeasePage();
     }, 20000);
 
    return this.loadLeasePage();
  }


  loadLeasePage = async () => {
    var sc = this.getScannables();
    var localScannables = Array();
    var self = this;
    self.state.slides = Array();
    sc.then(function(result){
	  var numLeases = result.length;
	  var scannable;
	  var currentScannableStats = self.state.scannableStats;
    //populate the content on each card
          for(var i=0; i<numLeases; i++)
          {
            var upcHash = String(result[i]);
            let scannable;
            let currentStaker;
            let amountStaked;
            let word;
	    let rewardInfo;
            var tempSc = self.getScannable(upcHash);
            currentScannableStats[upcHash] = tempSc;

            (async () => {
                let data = upcHash.substring(0,upcHash.length);
		var rewardKey = data + "-reward";
                rewardInfo = await self.props.getRewardInfo(data);
        	var currentUpcState = self.state[data];
        	if(currentUpcState) {
        	   currentUpcState.push(rewardInfo.isOwned);
        	   currentUpcState.push(rewardInfo.rewards);
        	   currentUpcState.push(rewardInfo.lastRewardTimestamp);
                   self.setState({[rewardKey]: currentUpcState});
        	}
                //slides.data.push(rewardInfo);
                var md5 = require('md5');
                var checksum = md5(rewardInfo.owner + rewardInfo.amountStaked + CHECKSUM);
                checksum = checksum.substr(0,16);
                const web3 = window.web3;
                var qrJson = {
		   "intent": "collectInterest",
                   "checksum": checksum,
                   "upc": rewardInfo.word,
                }
                rewardInfo.qrJson = qrJson;
        	console.log("REWARD  INFO: " + JSON.stringify(rewardInfo));
                var localSlides = self.state.slides;
                localSlides.push(rewardInfo);
                self.setState({slides: localSlides});
                var localSliderKey = Math.random();
                self.setState({sliderKey: localSliderKey});
	        var localSlideshow = <Slideshow key={localSliderKey} unstakeTokens={self.props.unstakeTokens} slides={localSlides} />
               console.log(localSlideshow); 
                self.setState({slideshow: localSlideshow});
                return rewardInfo;
        //	console.log("OWNED  INFO: " + JSON.stringify(rewardInfo.isOwned));
            })();

            //scannable = self.buildCard(i,upcHash.substring(0,upcHash.length));
            //localScannables.push(scannable);
            //var flipId = "flip" + upcHash;
	    //self.setState({[flipId]:self.state[flipId]});
          }


	  self.setState({scannables:localScannables});
    });

  }

  getScannable = async (upcHash) => {
    const { accounts, contract } = this.state;
    let scannable = await this.props.getScannable(upcHash);
    return scannable;
  };

  getScannables = async () => {
    const { accounts, contract } = this.state;
    let scannables = await this.props.getMyScannables();
    return scannables;
  };

  flipCard = (data) => {
    var flipKey = "flip" + data;
    this.setState({[flipKey]: !this.state[flipKey]});
  }

  render() {
    return (
      <div id="content" className="mt-3">
        <div className="card mb-4" >
          <div className="card-body">
            {this.state.slideshow}
          </div>
        </div>
      </div>
    );
  }
}

export default Main;
