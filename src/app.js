/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var ajax = require('ajax');
var Vibe = require('ui/vibe');
var Settings = require('settings');
var Wakeup = require('wakeup');

//Settings 
var refresh;
var violentOnly;
var vibrateOff;

var options = Settings.option();
console.log("Current Save = " + JSON.stringify(options));

if (Object.keys(options).length === 0){
    refresh = Settings.option('refresh', false);
    violentOnly = Settings.option('violentOnly', true);
    vibrateOff = Settings.option('vibrateOff', false);
} else {
  refresh = Settings.option('refresh');
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
        title: 'Updates',
        subtitle: 'Toggle updates'
      }, {
        title: 'Violent/All Crime',
        subtitle: 'Violent or all crimes.'
      },{
        title: 'Notifications',
        subtitle: 'Adjust Notifications'
      },{
        title: 'Time',
        subtitle: 'Adjust period'
      }]
    }]
  });
  menu.show();
  menu.on('select', function(e) {
    if(e.itemIndex === 0)
      {
        drawUpdateFreq();
      } else if (e.itemIndex === 1){
        drawCrimeToggle();
      } else if (e.itemIndex === 2)
      {
          drawNotifications();
      } else if (e.itemIndex === 3)
      {
        drawRadius();
      } else if(e.itemIndex === 4)
      {
         drawTime();   
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
        title: '20 mins',
      }, {
        title: 'Never',
      }]
    }]
  });
  menu.show();
  menu.on('select', function(e) {
    if(e.itemIndex === 0)
      {
        refresh = Settings.option('refresh', true);
      } else if (e.itemIndex == 1){
        refresh = Settings.option('refresh', false);
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
  menu.on('select', function(e) {
    if(e.itemIndex === 0)
      {
        violentOnly = Settings.option('violentOnly', true);
      } else {
        violentOnly = Settings.option('violentOnly', false);
      }
  });
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
  menu.on('select', function(e) {
  if(e.itemIndex === 0)
  {
    vibrateOff = Settings.option('vibrateOff', false);
  } else {
    vibrateOff = Settings.option('vibrateOff', true);
  }
  });
}

function drawTime()
{
  var menu = new UI.Menu({
    sections: [{
      items: [{
        title: '1 month',
      }, {
        title: '3 months',
      },{
        title: '6 months',
      },{
        title: '12 months',
      }]
    }]
  });
  menu.show();
  menu.on('select', function(e) {
  if(e.itemIndex === 0)
  {
    vibrateOff = Settings.option('vibrateOff', false);
  } else {
    vibrateOff = Settings.option('vibrateOff', true);
  }
  });
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

// Single wakeup event handler example:
Wakeup.launch(function(e) {
  console.log('Wakeup event! ' + JSON.stringify(e));
  main.body("just woke up");
  // Get location updates
  watchId = navigator.geolocation.getCurrentPosition(success, error, options);
  
  scheduleWakeup();
});

function scheduleWakeup() {
  Wakeup.schedule(
    {
      // the +1200 could be replaced by the setting
      time: Date.now() / 1000 + 1200,
    },
    function(e) {
      if (e.failed) {
        // Log the error reason
        console.log('Wakeup set failed: ' + e.error);
      } else {
        console.log('Wakeup set! Event ID: ' + e.id);
      }
    }
  );
}

