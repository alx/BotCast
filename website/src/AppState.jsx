import { observable } from 'mobx';

class AppState {

  @observable items = [];
  @observable labels = [];

  initLinks(json) {
    this.items = json.items;
    this.items.forEach( item => {
      item.actions.forEach( action => {
        if(action.action !== 'submitted' && this.labels.indexOf(action.action) === -1) {
          this.labels.push(action.action);
        }
      })
    });
  }

}

export default AppState;
