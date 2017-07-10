var fs = require('fs');
var csv = require('ya-csv');

let json_content = {items: []};

var reader = csv.createCsvFileReader('backup.csv', {
    'separator': ',',
    'quote': '"',
    'escape': '"',
    'comment': '',
    'nestedQuotes': true,
});
reader.setColumnNames([ 'timestamp', 'action', 'content' ]);

var expression = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/i;
var regex = new RegExp(expression);

reader.addListener('data', function(data) {

  let item = json_content.items.find( item => {
    return item.text == data.content;
  });

  if(item) {
    item.actions.push({action: data.action, timestamp: parseInt(data.timestamp)});
  } else {
    const parsedUrl = regex.exec(data.content);
    let url = null;
    if(parsedUrl && parsedUrl.length > 0)
      url = parsedUrl[0];

    json_content.items.push({
      url: url,
      text: data.content,
      actions: [{action: data.action, timestamp: parseInt(data.timestamp)}]
    });
  }

  fs.writeFileSync('regex.json', JSON.stringify(json_content, null, 4));
});

