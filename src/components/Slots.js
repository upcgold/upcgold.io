import React from 'react'

const { createRef , Component } = React;

export default class Slots extends Component {
  static defaultProps = {
    fruits: ["🍒", "🍉", "🍊", "🍓", "🍇", "🥝"]
  };

  constructor(props) {
    super(props);
    this.state = { fruit1: "🍒", fruit2: "🍒", fruit3: "🍒", rolling: false };

    // get ref of dic onn which elements will roll
    this.slotRef = [createRef(), createRef(), createRef(), createRef(), createRef()];
  }

  // to trigger roolling and maintain state
  roll = () => {
    this.setState({
      rolling: true
    });
    setTimeout(() => {
      this.setState({ rolling: false });
    }, 300);

    // looping through all 3 slots to start rolling
    this.slotRef.forEach((slot, i) => {
      // this will trigger rolling effect
      const selected = this.triggerSlotRotation(slot.current);
      this.setState({ [`fruit${i + 1}`]: selected });
    });

  };

  // this will create a rolling effect and return random selected option
  triggerSlotRotation = ref => {
    function setTop(top) {
      ref.style.top = `${top}px`;
    }
    let options = ref.children;
    let randomOption = Math.floor(
      Math.random() * Slots.defaultProps.fruits.length
    );
    let choosenOption = options[randomOption];
    setTop(-choosenOption.offsetTop + 2);
    return Slots.defaultProps.fruits[randomOption];
  };

  render() {
    return (
      <div className="SlotMachine">
        <div className="slot">
          <section>
            <div className="container" ref={this.slotRef[0]}>
              {Slots.defaultProps.fruits.map((fruit, i) => (
                <div key={i}>
                  <span>{fruit}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="slot">
          <section>
            <div className="container" ref={this.slotRef[1]}>
              {Slots.defaultProps.fruits.map(fruit => (
                <div>
                  <span>{fruit}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="slot">
          <section>
            <div className="container" ref={this.slotRef[2]}>
              {Slots.defaultProps.fruits.map(fruit => (
                <div>
                  <span>{fruit}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="slot">
          <section>
            <div className="container" ref={this.slotRef[3]}>
              {Slots.defaultProps.fruits.map(fruit => (
                <div>
                  <span>{fruit}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="slot">
          <section>
            <div className="container" ref={this.slotRef[4]}>
              {Slots.defaultProps.fruits.map(fruit => (
                <div>
                  <span>{fruit}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div
          className={!this.state.rolling ? "roll rolling" : "roll"}
          onClick={!this.state.rolling && this.roll}
          disabled={this.state.rolling}
        >
          {this.state.rolling ? "Rolling..." : "ROLL"}
        </div>
      </div>
    );
  }
}
