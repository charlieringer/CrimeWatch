/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var Vibe = require('ui/vibe');

var numbMonths = 1;
var numbCrimes = 1;
var updateTime = 0;
var dangerlevel = 0;



var main = new UI.Card({
  title: 'Crime Watch',
  //icon: 'images/menu_icon.png',
  body: 'Number of crimes in last ' + numbMonths + ' month(s): ' + numbCrimes,
  subtitleColor: 'indigo', // Named colors
  bodyColor: '#9a0036' // Hex colors
});

main.show();

main.on('click', 'up', function(e) {
  numbCrimes++;
  Vibe.vibrate('long');
});

main.on('click', 'select', function(e) {
  var menu = new UI.Menu({
    sections: [{
      items: [{
        title: 'Update Freq',
        subtitle: 'Change update freq'
      }, {
        title: 'Violent/All Crime',
        subtitle: 'Choose Violent or all crime'
      },{
        title: 'Notifications',
        subtitle: 'Adjust Notifications'
      }]
    }]
  });
  menu.show();
  menu.on('select', function(e) {
    if(e.itemIndex == 0)
      {
        drawUpdateFreq();
      } else if (e.itemIndex == 1){
        drawCrimeToggle();
      } else if (e.itemIndex == 2)
      {
          drawNotifications();
      }
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
  });
});

main.on('click', 'down', function(e) {
});

function drawUpdateFreq(){
  var menu = new UI.Menu({
    sections: [{
      items: [{
        title: '10 mins',
      }, {
        title: '30 mins',
      },{
        title: '1 hour',
      },{
        title: '5 hours',
      }]
    }]
  });
  menu.show();
  menu.on('select', function(e) {
    if(e.itemIndex == 0)
      {
        updateTime = 10;
      } else if (e.itemIndex == 1){
        updateTime = 30;
      } else if (e.itemIndex == 2)
      {
        updateTime = 60;
      } else if (e.itemIndex == 3)
      {
        updateTime = 5*60;
      }
  });
}

function drawCrimeToggle(){
  var menu = new UI.Menu({
    sections: [{
      items: [{
        title: 'Violent only',
      }, {
        title: 'All Crime',
      }]
    }]
  });
  menu.show();
}

function drawNotifications()
{
  var menu = new UI.Menu({
    sections: [{
      items: [{
        title: 'Vibrate',
      }, {
        title: 'No Vibrate',
      }]
    }]
  });
  menu.show();
}