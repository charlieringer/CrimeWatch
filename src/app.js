/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var ajax = require('ajax');
var Vibe = require('ui/vibe');
var Settings = require('settings');

//Settings 
var refreshTime;
var violentOnly;
var vibrateOff;

var options = Settings.option();
console.log("Current Save = " + JSON.stringify(options));

if (Object.keys(options).length === 0){
    refreshTime = Settings.option('refreshTime', 10);
    violentOnly = Settings.option('violentOnly', true);
    vibrateOff = Settings.option('vibrateOff', false);
} else {
  refreshTime = Settings.option('refreshTime');
  violentOnly = Settings.option('violentOnly');
  vibrateOff = Settings.option('vibrateOff');
}




var watchId;

var main = new UI.Card({
  title: 'Crime Watch',
  //icon: 'images/menu_icon.png',
  body: 'Fetching data...',
  subtitleColor: 'indigo', // Named colors
  bodyColor: '#9a0036' // Hex colors
});

main.show();

main.on('click', 'up', function(e) {
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
    if(e.itemIndex === 0)
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
    if(e.itemIndex === 0)
      {
        refreshTime = Settings.option('refreshTime', 10);
      } else if (e.itemIndex == 1){
        refreshTime = Settings.option('refreshTime', 30);
      } else if (e.itemIndex == 2)
      {
        refreshTime = Settings.option('refreshTime', 60);
      } else if (e.itemIndex == 3)
      {
        refreshTime = Settings.option('refreshTime', 300);
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

function success(pos) {
  console.log('Location changed!');
  main.body('location found, getting data');
  var lat = pos.coords.latitude;
  var long = pos.coords.longitude;
  console.log('lat= ' + lat + ' lon= ' + long);
  var url = 'https://data.police.uk/api/crimes-street/all-crime?lat=' + lat + '&lng=' + long + '&date=2016-02';
//   var url = 'https://data.police.uk/api/crimes-street/all-crime?lat=' + 51.5 + '&lng=' + 0.13 + '&date=2016-02';
  ajax(
    {
      url: url,
      type: 'json'
    },
    function(data) {
      // Success!
      console.log("Successfully fetched crime data!");
      var crimeCount = 0;
      for (var i = 0; i < data.length; ++i) {
        var obj = data[i];
//         console.log(obj.category);
        if (obj.category === "violent-crime" || obj.category === "theft-from-the-person") {
          ++crimeCount;
        }
      }
      main.body('Number of crimes in last ' + 1 + ' month(s): ' + crimeCount);
    },
    function(error) {
      // Failure!
      console.log('Failed fetching crime data: ' + error);
      main.body('Failed to fetch crime data. Please check your connection.');
    }
  );
}

function error(err) {
  console.log('location error (' + err.code + '): ' + err.message);
  main.body('Failed to fetch location data. Please check your connection.');
}

var options = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 5000
};

// Get location updates
// watchId = navigator.geolocation.watchPosition(success, error, options);
watchId = navigator.geolocation.getCurrentPosition(success, error, options);

// success(null);

// Clear the watch and stop receiving updates
// navigator.geolocation.clearWatch(watchId);