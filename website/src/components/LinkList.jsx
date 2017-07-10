import React, {Component} from 'react';
import { observer } from 'mobx-react';

import LinkItem from './LinkItem';

@observer
class LinkList extends Component {

  render() {

    if(!this.props.items)
      return null;

    return (
      <div className="container">
        {this.props.items.sort( (b, a) => {
            return a.actions[0].timestamp - b.actions[0].timestamp;
          }).map((item, index) => {
            return <LinkItem key={index} item={item}/>
          })
        }
      </div>
    )
  }

}

export default LinkList;
