'use strict';

import React, {Component} from 'react';

class VideoBackground extends Component {
    constructor (props) {
        super(props);

        this.state = {
        }
    }

    render () {
        return (

<div>
<video autoplay muted loop id="myVideo">
  <source src="https://archive.org/download/SampleVideo1280x7205mb/SampleVideo_1280x720_5mb.mp4" type="video/mp4"/>
</video>
<div style={{"background": "rgba(0, 0, 0, 0.4)"}} class="content">
        {this.props.children}
</div>
</div>
        )
    }
};

export default VideoBackground;
