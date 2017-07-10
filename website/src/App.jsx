import React, {Component} from 'react';
import { observer } from 'mobx-react';

import LinkList from './components/LinkList';

@observer
class App extends Component {

  render() {
    const appState = this.props.appState;
    return (
      <div className="container">
        <div className="row">
        </div>
        <div className="row">
          <LinkList items={appState.items}/>
        </div>
      </div>
    )
  }

}

export default App;
