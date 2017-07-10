import React, {Component} from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';

@observer
class LinkItem extends Component {

  render() {
    const item = this.props.item;

    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <a href={item.url}>{item.text}</a>
          <p>{moment.unix(item.actions[0].timestamp).format}</p>
          <p>{item.actions.filter( action => {
              return action.action !== 'submitted';
            }).map( (action, index) => {
              return <span className="label label-default">{action.action}</span>
            })
          }</p>
        </div>
      </div>
    )
  }

}

export default LinkItem;
