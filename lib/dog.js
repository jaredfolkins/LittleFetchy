function Dog() {

  this.minute = localStorage['minute'];

  this._DEBUG = 1;
  this._currentUsage = localStorage['usage'];
  this._monthlyCap = localStorage['cap'];
  this._percent = localStorage['percent'];
  this._supportTelephone = '541-555-1212';


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

  this.init = function() {
    this.run();
  };

  this.log = function(text) {
    if(this._DEBUG == 1) {
      console.log(text);
    }
  };

  this.setUsageBadge = function(usage) {
    this.log('setUsageBadge() Current Usage = ' + this._currentUsage);
    chrome.browserAction.setBadgeText({
      text: String( usage + 'g' )
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: [0, 0, 0, 255]
    });
  };

  this.setUsageBadgeLoading = function(usage) {
    this.log('setUsageBadgeLoading()');
    chrome.browserAction.setBadgeText({
      text: String( 'fetch' )
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: [200, 150, 0, 255]
    });
  };

  this.setUsageBadgeError = function() {
    this.log('setUsageBadgeError');
    chrome.browserAction.setBadgeText({
      text: String('error')
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: [255, 0, 0, 255]
    });
  };

  this.notify = function() {

    // Create a simple text notification:
    var usage = localStorage['usage'] || 0;
    this.log("dog.notify(): usage = " + usage);

    var cap = localStorage['cap'] || 0;
    this.log("dog.notify(): cap = " + cap);

    var percent = localStorage['percent'] || 1;
    this.log("dog.notify(): percent = " + percent );

    var target = cap / usage * 10;
    var pattern = /(\d{1,2})/g
    var results = pattern.exec(target);
    this.log("dog.notify(): " + results);

    var percentage = results ? results[1] : 1;

    this.log("dog.notify(): percentage = " + percentage);

    if(percentage >= percent) {
      //var message = 'You have used ' + percentage + '% of your monthly alloment. If you call ' + this._supportTelephone + ' you can upgrade your account.';
      var message = 'You have used ' + percentage + '% of your monthly allotment.';
      this.log("dog.notify(): " + message);
      var notification = webkitNotifications.createNotification(
        '48x48.png',  // icon url - can be relative
        'Usage Alert!',  // notification title
        message
      );
      notification.show();
    }
  };

  this.setBadge = function(text) {
    var pattern = /Current\sUsage:\s\<\/strong\>(\d*)\.?\d?\sGB\/(\d*)\sGB\<\/td\>/g;
    var results = pattern.exec(text);
    if(results) {
      localStorage['usage'] = results[1];
      localStorage['cap'] = results[2];
      this._currentUsage = results[1];
      this._monthlyCap = results[2];
      this.setUsageBadge(dog._currentUsage);
    } else {
      this.setUsageBadgeError();
      // this removed their password if there was an error but that was annoying.
      //this.unsetLocalStoragePassword();
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
    var url = "https://secure.bendbroadband.com/usage/usage.asp?action=submit&pageID=mbb&subID=hsiu&adct=3";
    var params = 'Submit1=View+Usage&email=' + email + '&password=' + password;
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
