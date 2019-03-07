import React, { Component } from 'react';
import Led from './Led';
import './App.css';

class App extends Component {
  state = {
    colors: [],
  }

  componentDidMount() {
    setInterval(() => {
      fetch('http://localhost:3000/leds/1')
        .then(res => res.json())
        .then(({ colors }) => {
          this.setState({ colors });
        })
    }, 100)
  }

  blink = () => {
    fetch('http://localhost/blink?color=0x115555&times=10');
  }

  render() {
    const { colors } = this.state;
    return (
      <div>
        <button onClick={() => this.blink()}>Blink</button>
        <br />
        <div className="App">
          {colors.map((color, ix) => (
            <Led key={ix.toString()} color={(typeof color === 'string' ? color : '').replace('0x', '#')} />
          ))}
        </div>
      </div>
    );
  }
}

export default App;
