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



class Main extends Component {

  constructor(props) {
    super(props)
    let scannables;
    var show = new Slides();
      this.state = {
        scannables: '0',
	scannableStats: [],
	scannableRewards: [],
	cardsLoading: true,
        flipped: [],
	mySlideshow: show,
	loadingGif: <img src={loader} alt="loading..." />
       }
    this.loadLeasePage = this.loadLeasePage.bind(this);
    this.getScannables = this.getScannables.bind(this);
    this.getScannable = this.getScannable.bind(this);
    this.buildCard = this.buildCard.bind(this);
    this.flipCard= this.flipCard.bind(this);

  }

 
  componentDidMount = async () => {
    var self = this;
    setInterval(function() {
        return self.loadLeasePage();
     }, 5000);
 
    return this.loadLeasePage();
  }


  loadLeasePage = async () => {
    var sc = this.getScannables();
    var localScannables = Array();
    var self = this;
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
            var tempSc = self.getScannable(upcHash);
            currentScannableStats[upcHash] = tempSc;
            scannable = self.buildCard(i,upcHash.substring(0,upcHash.length));
            localScannables.push(scannable);
            var flipId = "flip" + upcHash;
	    self.setState({[flipId]:self.state[flipId]});
          }


	  self.setState({scannables:localScannables});

          var show = <Slideshow slides={localScannables} />;
          self.setState({mySlideshow: show});
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

  /**
   * the goal of this function is to output card html for one scannable.  this function resolves
   * a promise from the loadPage function and then does a lookup to get the reward information for
   * each scannable (RewardGranter)
   */
  buildCard = (count,data) => {
    var promiseStats   = this.state.scannableStats[data];
    var promiseRewards = this.state.scannableRewards[data];
    var rewardKey = data + "-reward";
    var currentStaker;
    var amountStaked = this.state.loadingGif;
    var amountStaked = 0;
    var isOwned;
    var word;
    let rewardInfo;
    //building the card is 2 step process.  first resolve the promise from above (when the load page function above is called) and set state info for this individual
    //scannable.
    var self = this;
    (async () => {
        rewardInfo = await self.props.getRewardInfo(data);
	var currentUpcState = self.state[data];
	if(currentUpcState) {
	   currentUpcState.push(rewardInfo.isOwned);
	   currentUpcState.push(rewardInfo.rewards);
	   currentUpcState.push(rewardInfo.lastRewardTimestamp);
           self.setState({[rewardKey]: currentUpcState});
	}
	//console.log("REWARD  INFO: " + JSON.stringify(rewardInfo));
        var slides = new Slides();
        slides.data.push(rewardInfo);
        console.log(slides);
        //self.state.mySlideshow.addData(rewardInfo);
        return rewardInfo;
//	console.log("OWNED  INFO: " + JSON.stringify(rewardInfo.isOwned));
    })();

    }

  render() {
    return (
      <div id="content" className="mt-3">
        <div className="card mb-4" >
          <div className="card-body">
          </div>
        </div>
      </div>
    );
  }
}

export default Main;
