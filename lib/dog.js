function Dog() {

  this.GREY = [96,96,96, 255];
  this.BLACK = [0, 0, 0, 255];

  this.RED = [156, 0, 0, 255];
  this.ORANGE2 = [156, 73, 0, 255];
  this.ORANGE1 = [255, 130, 0, 255];
  this.YELLOW = [156, 110, 0, 255];
  this.GREEN = [36, 119, 0, 255];

  this.minute = localStorage['minute'];
  this._debug = localStorage['debug'];
  this._currentUsage = localStorage['usage'];
  this._monthlyCap = localStorage['cap'];
  this._percent = localStorage['percent'];

  if(!this._percent) {
    localStorage['percent'] = 90;
  }

  if(!this.minute) {
    localStorage['minute'] = 120;
  }

  if(!this._usage) {
    localStorage['usage'] = 0;
  }

  if(!this._cap) {
    localStorage['cap'] = 0;
  }

  if(!this._debug) {
    localStorage['debug'] = 0;
  }

  this.init = function() {
    this.run();
  };

  this.log = function(text) {
    if(this._debug == 1) {
      console.log(text);
    }
  };

  this.getCurrentPercentage = function() {
    var usage = localStorage['usage'] || 0;
    this.log("dog.getCurrentPercentage(): usage = " + usage);

    var cap = localStorage['cap'] || 0;
    this.log("dog.getCurrentPercentage(): cap = " + cap);


    var target = cap / usage * 10;
    var pattern = /(\d{1,2})/g
    var results = pattern.exec(target);
    this.log("dog.getCurrentPercentage(): " + results);

    var currentPercentage = results ? results[1] : 1;
    this.log("dog.getCurrentPercentage(): currentPercentage= " + currentPercentage);
    return currentPercentage;
  }

  this.badgeColorByPercentage = function(){
    var cp = this.getCurrentPercentage();
    if (cp >= 90) {
      return this.RED;
    } else if (cp >= 75) {
      return this.ORANGE2
    } else if (cp >= 50) { 
      return this.ORANGE1
    } else if (cp >= 25) { 
      return this.YELLOW
    } 
    return this.GREEN
  }

  this.setUsageBadge = function(usage) {
    this.log('dog.setUsageBadge() Current Usage = ' + this._currentUsage);
    chrome.browserAction.setBadgeText({
      text: String( usage + 'G' )
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: this.badgeColorByPercentage()
    });
  };

  this.setUsageBadgeLoading = function(usage) {
    this.log('dog.setUsageBadgeLoading()');
    chrome.browserAction.setBadgeText({
      text: String( 'fetch')
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: this.GREY
    });
  };

  this.setUsageBadgeError = function() {
    this.log('setUsageBadgeError');
    chrome.browserAction.setBadgeText({
      text: String('error')
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: this.BLACK
    });
  };

  this.notify = function() {

    // Create a simple text notification:
    var debug = localStorage['debug'] || 0;
    this.log("dog.notify(): debug = " + debug);
    this._debug = debug;

    var percent = localStorage['percent'] || 1;
    this.log("dog.notify(): alertPercent = " + percent );

    var currentPercentage = this.getCurrentPercentage();

    if(currentPercentage >= percent) {
      var message = currentPercentage + '% of your bandwidth cap has been consumed. Best to try and not go over.';
      this.log("dog.notify(): " + message);
      var opt = {
        type: "basic",
        title: "LittleFetchy Alert",
        message: message,
        iconUrl: "64x64.png"
      };
      var notification = chrome.notifications.create("", opt, function(){});
    }
  };

  this.setBadge = function(text) {
    var pattern = /<p><strong>Current\sUsage\:\s<\/strong>\s(\d*)\.?\d?\d?\sGB\/(\d*)\sGB<\/p>/g;
    var results = pattern.exec(text);
    if(results) {
      localStorage['usage'] = results[1];
      localStorage['cap'] = results[2];
      this._currentUsage = results[1];
      this._monthlyCap = results[2];
      this.setUsageBadge(dog._currentUsage);
    } else {
      this.setUsageBadgeError();
    }
  };

  this.unsetLocalStoragePassword = function() {
    localStorage['password'] = '';
  };

  this.run = function() {
    var email = encodeURIComponent(localStorage['email']);
    var password = encodeURIComponent(localStorage['password']);
    var usage = localStorage['usage'];
    this.log("dog.run(): " + email + "," + password + "," + usage);
    if(email != 'undefined' && password != 'undefined') {
      this.scrape_bendbroadband(email, password);
    }
  };

  this.scrape_bendbroadband = function(email, password) {
    dog.log("dog.scrape_bendbroadband()");
    this.log(email);
    this.log(password);
    var url = "https://bendbroadband.com/usage/?action=submit";
    var params = "uaddress=" + email + "&upassword=" + password;
    this.http_request(url, params);
  }

  this.http_request = function(url, params) {
    this.log("dog.http_request()");
    this.setUsageBadgeLoading();
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(params);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 ) {
        //dog.log(xhr.responseText);
        dog.setBadge(xhr.responseText);
      }
    }
  }
};
