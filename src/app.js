/**
 * CrimeWatch
 *
 * Authors: Amrish Parmar & Charlie Ringer
 */

var UI = require('ui');
var ajax = require('ajax');
var Vibe = require('ui/vibe');
var Accel = require('ui/accel');
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
var personalCrimeCount = 0;

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

var locations;
var personalLocations;

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
  subtitle: 'Fetching data...',
  subtitleColor: 'indigo', // Named colors
  bodyColor: '#9a0036' // Hex colors
});

main.show();

main.on('click', 'up', function(e) {
  var numberOfCrimes = -1;
  var hotspot = "no value";
  var locationsToUse;
  for (var key in locations) {
    console.log(locations[key]);
    if (personalCrime)
      {
        locationsToUse = personalLocations;
      } else {
        locationsToUse = locations;
      }
    if (locationsToUse[key] > numberOfCrimes)
    {
      numberOfCrimes = locationsToUse[key];
      hotspot = key;
    }
  }
  var card;
  card = new UI.Card({
        title: 'Hotspot:',
        body: 'The area with the largest number of crimes is: ' + hotspot + 
        '\nWith ' + numberOfCrimes + ' reports.'
  });
  card.show();
});

main.on('click', 'select', function(e) {
        if (!vibrateOff)
    {
      Vibe.vibrate('short');
    }
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
      }]
    }]
  });
  menu.show();
  menu.on('select', function(e) {
      if (!vibrateOff)
    {
      Vibe.vibrate('short');
    }
    if(e.itemIndex === 0)
      {
        drawUpdateFreq();
      } else if (e.itemIndex === 1){
        drawCrimeToggle();
      } else if (e.itemIndex === 2)
      {
          drawNotifications();
      } 
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
  });
});

main.on('click', 'down', function(e) {
  var card;
  if (personalCrime)
  {
      card = new UI.Card({
        scrollable: true,
        title: 'Summary:',
        body: 'Possession of Weapon: ' + crimes.possessionOfWep +
        '\nPersonal Theft: ' + crimes.theftPerson +
        '\nViolent crime: ' + crimes.violentCrime 
  });
  card.show();
      
  } else {
    card = new UI.Card({
      scrollable: true,
      title: 'Summary:',
      body: 
      'Anti Social: ' + crimes.antiSocial +
      '\nBicycle Theft: ' + crimes.bicycleTheft +
      '\nBurglary: ' + crimes.burglary +
      '\nCriminal Damage: ' + crimes.crimDamageArson +
      '\nDrugs: ' + crimes.drugs +
      '\nOther Theft: ' + crimes.otherTheft +
      '\nPublic Order: ' + crimes.publicOrder +
      '\nRobbery: ' + crimes.robbery +
      '\nShoplifting: ' + crimes.shoplifting +
      '\nVehicle Crime: ' + crimes.vehicleCrime +
      '\nPossession of Weapon: ' + crimes.possessionOfWep +
      '\nPersonal Theft: ' + crimes.theftPerson +
      '\nViolent crime: ' + crimes.violentCrime +
      '\nOther crime: ' + crimes.otherCrime
    });
      card.show();
    }
  console.log(crimes);
});

Accel.on('tap', getLocation());

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
    if (!vibrateOff)
    {
      Vibe.vibrate('short');
    }
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
    if (!vibrateOff)
    {
      Vibe.vibrate('short');
    }
    if(e.itemIndex === 0)
      {
        personalCrime = Settings.option('personalOnly', true);
        main.subtitle('Number of crimes in last month: ' + personalCrimeCount);
      } else {
        personalCrime = Settings.option('personalOnly', false);
        main.subtitle('Number of crimes in last month: ' + crimeCount);
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
    if (!vibrateOff)
    {
      Vibe.vibrate('short');
    }
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
      personalLocations = {};
      locations = {};
      for (var i = 0; i < data.length; ++i) {
        var obj = data[i];
        
        var location = obj.location.street.name;
        if((obj.category === "possession-of-weapons") || 
                            (obj.category === "theft-from-the-person") ||
                             (obj.category === "violent-crime") )
          { 
                    personalLocations[location] = (personalLocations[location]|| 0) +1;
          }
          locations[location] = (locations[location]|| 0) +1;

        if (obj.category === "anti-social-behaviour")
        {
          crimes.antiSocial++;
            crimeCount++;
        } else if (obj.category === "bicycle-theft")
        {
          crimes.bicycleTheft++;
            crimeCount++;
        } else if (obj.category === "burglary")
        {
          crimes.burglary++;
            crimeCount++;
        } else if (obj.category === "criminal-damage-arson")
        {
          crimes.crimDamageArson++;
            crimeCount++;
        } else if (obj.category === "drugs")
        {
         crimes.drugs++; 
            crimeCount++;
        } else if (obj.category === "other-theft")
        {
          crimes.otherTheft++;
            crimeCount++;
        } else if (obj.category === "public-order")
        {
          crimes.publicOrder++;
            crimeCount++;
        } else if (obj.category === "robbery")
        {
          crimes.robbery++;
            crimeCount++;
        } else if (obj.category === "shoplifting")
        {
          crimes.shoplifting++;
            crimeCount++;
        } else if (obj.category === "vehicle-crime")
        {
          crimes.vehicleCrime++;
            crimeCount++;
        } else if (obj.category === "other-crime")
        {
          crimes.otherCrime++;
            crimeCount++;
        } else if (obj.category === "possession-of-weapons")
        {
          crimes.possessionOfWep++;
          crimeCount++;
          personalCrimeCount++;
        } else if (obj.category === "theft-from-the-person")
        {
          crimes.theftPerson++;
          crimeCount++;
          personalCrimeCount++;
        } else if (obj.category === "violent-crime")
        {
          crimes.violentCrime++;
          crimeCount++;
          personalCrimeCount++;
        }         
      }
      console.log('Crimes:');
      //console.log(JSON.stringify(crimes));
  if(personalCrime)
    {
      main.subtitle('Number of crimes in last month: ' + personalCrimeCount);
    } else {
      main.subtitle('Number of crimes in last month: ' + crimeCount);
    }
    }
/**
 * Callback for when navigator.geolocation successfully retrieves location data
 */ 
function success(pos) {
  console.log('Location changed!');
  main.subtitle('location found, getting data');
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
      main.subtitle('Failed to fetch crime data. Please check your connection.');
    }
  );
}

/**
 * Callback for if navigator.geolocation fails to retrieve location data
 */ 
function error(err) {
  console.log('location error (' + err.code + '): ' + err.message);
  main.subtitle('Failed to fetch location data. Please check your connection.');
}

/**
 * Get the location and the trigger the callbacks
 */
function getLocation() {
  // Get location updates
  watchId = navigator.geolocation.getCurrentPosition(success, error, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000 
  });
}

/**
 * Wakeup event called when the app is launched or woken up
 */ 
Wakeup.launch(function(e) {
  console.log('Wakeup event! ' + JSON.stringify(e));
  
  // Get location updates
  getLocation();
  
  if (!vibrateOff)
    {
      Vibe.vibrate('long');
    }
  
  // set the the app to wakeup
  if(refresh)
    {
      scheduleWakeup();
    }
  
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

