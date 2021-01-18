'use strict';

import React, {Component} from 'react';

class VideoBackground extends Component {
    constructor (props) {
        super(props);

        this.state = {
            videoURL: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/av1/1080/Big_Buck_Bunny_1080_10s_1MB.mp4'
        }
    }

    render () {
        return (

<div>
<video autoplay muted loop id="myVideo">
  <source src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/av1/1080/Big_Buck_Bunny_1080_10s_1MB.mp4" type="video/mp4"/>
</video>
<div class="content">
        {this.props.children}
</div>
</div>
        )
    }
};

export default VideoBackground;
