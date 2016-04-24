/**
 * CrimeWatch
 *
 * Authors: Amrish Parmar & Charlie Ringer
 */

var UI = require('ui');
var ajax = require('ajax');
var Vibe = require('ui/vibe');
var Settings = require('settings');
var Wakeup = require('wakeup');

var watchId;

//Settings 
var refresh;
var personalCrime;
var vibrateOff;
var timeSetting;

//Crimes
var crimeCount = 0;

var crimes = {
  antiSocial : 0,
  bicycleTheft : 0,
  burglary : 0,
  crimDamageArson : 0,
  drugs : 0,
  otherTheft : 0,
  publicOrder : 0,
  robbery : 0,
  shoplifting : 0,
  vehicleCrime : 0,
  otherCrime : 0,
  possessionOfWep : 0,
  theftPerson : 0,
  violentCrime : 0,
};

var options = Settings.option();
console.log("Current Save = " + JSON.stringify(options));

if (Object.keys(options).length === 0) {
    refresh = Settings.option('refresh', false);
    personalCrime = Settings.option('personalOnly', true);
    vibrateOff = Settings.option('vibrateOff', false);
    timeSetting = Settings.option('time', 3);
} else {
  refresh = Settings.option('refresh');
  personalCrime = Settings.option('personalOnly');
  vibrateOff = Settings.option('vibrateOff');
  timeSetting = Settings.option('time');
}

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
        title: 'Personal/All Crime',
        subtitle: 'Personal or all crimes.'
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
        drawTime(); 
      }
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
  });
});

main.on('click', 'down', function(e) {
  if (personalCrime)
    {
      var card = new UI.Card({
        scrollable: true,
        title: 'Summary:',
        body: 'Possession of Weapon: ' + crimes.possessionOfWep +
        ' Personal Theft: ' + crimes.theftPerson +
        ' Violent crime: ' + crimes.violentCrime 
  });
  card.show();
      
    } else {
      var card = new UI.Card({
        scrollable: true,
        title: 'Summary:',
        body: 
        'Anti Social: ' + crimes.antiSocial +
        ' Bicycle Theft: ' + crimes.bicycleTheft +
        ' Burglary: ' + crimes.burglary +
        ' Criminal Damage: ' + crimes.crimDamageArson +
        ' Drugs: ' + crimes.drugs +
        ' Other Theft: ' + crimes.otherTheft +
        ' Public Order: ' + crimes.publicOrder +
        ' Robbery: ' + crimes.robbery +
        ' Shoplifting: ' + crimes.shoplifting +
        ' Vehicle Crime: ' + crimes.vehicleCrime +
        ' Possession of Weapon: ' + crimes.possessionOfWep +
        ' Personal Theft: ' + crimes.theftPerson +
        ' Violent crime: ' + crimes.violentCrime +
        ' Other crime: ' + crimes.otherCrime
  });
      card.show();
    }
  console.log(crimes);
  
});

/**
 * Draw menu item setting for how often to wake the app from sleep
 */ 
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

/**
 * Draw menu item for setting on whether to show only violent crime
 */ 
function drawCrimeToggle(){
  var menu = new UI.Menu({
    sections: [{
      items: [{
        title: 'Personal only',
      }, {
        title: 'All Crime',
      }]
    }]
  });
  menu.show();
  menu.on('select', function(e) {
    if(e.itemIndex === 0)
      {
        personalCrime = Settings.option('personalOnly', true);
      } else {
        personalCrime = Settings.option('personalOnly', false);
      }
  });
}

/**
 * Draw menu item for setting on whether to have vibes on or off
 */ 
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

/**
 * Draw menu item for setting time period to retrieve data
 */ 
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
    timeSetting = Settings.option('time', 1);
  } else if (e.itemIndex === 1) {
    timeSetting = Settings.option('time', 3);
  } else if (e.itemIndex === 2) {
    timeSetting = Settings.option('time', 6);
  } else if (e.itemIndex === 3) {
    timeSetting = Settings.option('time', 12);
  }
  });
}
function resetCrimes()
    {
      crimeCount = 0;
      for (var element in crimes) { 
        crimes[element] = 0;
    }
  }
function parseResponse(data) {
      // Success!
      console.log("Successfully fetched crime data!");
      resetCrimes();
      for (var i = 0; i < data.length; ++i) {
        var obj = data[i];
        if (obj.category === "anti-social-behaviour")
        {
          crimes.antiSocial++;
          if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "bicycle-theft")
        {
          crimes.bicycleTheft++;
          if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "burglary")
        {
          crimes.burglary++;
          if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "criminal-damage-arson")
        {
          crimes.crimDamageArson++;
          if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "drugs")
        {
         crimes.drugs++; 
         if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "other-theft")
        {
          crimes.otherTheft++;
          if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "public-order")
        {
          crimes.publicOrder++;
          if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "robbery")
        {
          crimes.robbery++;
          if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "shoplifting")
        {
          crimes.shoplifting++;
          if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "vehicle-crime")
        {
          crimes.vehicleCrime++;
          if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "other-crime")
        {
          crimes.otherCrime++;
          if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "possession-of-weapons")
        {
          crimes.possessionOfWep++;
          crimeCount++;
        } else if (obj.category === "theft-from-the-person")
        {
          crimes.theftPerson++;
          crimeCount++;
        } else if (obj.category === "violent-crime")
        {
          crimes.violentCrime++;
          crimeCount++;
        }         
      }
      console.log('Crimes:');
      //console.log(JSON.stringify(crimes));
      main.body('Number of crimes in last ' + 1 + ' month(s): ' + crimeCount);
    }
/**
 * Callback for when navigator.geolocation successfully retrieves location data
 */ 
function success(pos) {
  console.log('Location changed!');
  main.body('location found, getting data');
  var lat = pos.coords.latitude;
  var long = pos.coords.longitude;
  console.log('lat= ' + lat + ' lon= ' + long);
 // var url = 'https://data.police.uk/api/crimes-street/all-crime?lat=' + lat + '&lng=' + long + '&date=2016-02';
    var url = 'https://data.police.uk/api/crimes-street/all-crime?lat=' + 51.5 + '&lng=' + 0.12 + '&date=2016-02';
  ajax(
    {
      url: url,
      type: 'json'
    }, parseResponse,
    function(error) {
      // Failure!
      console.log('Failed fetching crime data: ' + error);
      main.body('Failed to fetch crime data. Please check your connection.');
    }
  );
}

function parseResponse(data) {
      // Success!
      console.log("Successfully fetched crime data!");
      resetCrimes();
      for (var i = 0; i < data.length; ++i) {
        var obj = data[i];
        if (obj.category === "anti-social-behaviour")
        {
          crimes.antiSocial++;
          if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "bicycle-theft")
        {
          crimes.bicycleTheft++;
          if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "burglary")
        {
          crimes.burglary++;
          if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "criminal-damage-arson")
        {
          crimes.crimDamageArson++;
          if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "drugs")
        {
         crimes.drugs++; 
         if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "other-theft")
        {
          crimes.otherTheft++;
          if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "public-order")
        {
          crimes.publicOrder++;
          if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "robbery")
        {
          crimes.robbery++;
          if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "shoplifting")
        {
          crimes.shoplifting++;
          if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "vehicle-crime")
        {
          crimes.vehicleCrime++;
          if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "other-crime")
        {
          crimes.otherCrime++;
          if(!personalCrime)
          {
            crimeCount++;
          }
        } else if (obj.category === "possession-of-weapons")
        {
          crimes.possessionOfWep++;
          crimeCount++;
        } else if (obj.category === "theft-from-the-person")
        {
          crimes.theftPerson++;
          crimeCount++;
        } else if (obj.category === "violent-crime")
        {
          crimes.violentCrime++;
          crimeCount++;
        }         
      }
      main.body('Number of crimes in last ' + 1 + ' month(s): ' + crimeCount);
    }

/**
 * Callback for if navigator.geolocation fails to retrieve location data
 */ 
function error(err) {
  console.log('location error (' + err.code + '): ' + err.message);
  main.body('Failed to fetch location data. Please check your connection.');
}

/**
 * Wakeup event called when the app is launched or woken up
 */ 
Wakeup.launch(function(e) {
  console.log('Wakeup event! ' + JSON.stringify(e));
  
  // Get location updates
  watchId = navigator.geolocation.getCurrentPosition(success, error, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000 
  });
  
  // set the the app to wakeup
  scheduleWakeup();
});

/**
 * Schedules the app to wakeup after a given time
 */ 
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

