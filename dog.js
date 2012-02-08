function Dog() {
  this._DEBUG = 1;
  this._currentUsage = localStorage['usage'] || 0;
  this._monthlyCap = localStorage['cap'] || 0;

  this.log = function(text) {
    if(dog._DEBUG == 1) {
      console.log(text);
    }
  };

  this.setUsageBadge = function() {
    dog.log('setUsageBadge() Current Usage = ' + dog._currentUsage);
    chrome.browserAction.setBadgeText({
      text: String( dog._currentUsage + 'g' )
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: [0, 0, 0, 255]
    });
  };

  this.setUsageBadgeError = function() {
    dog.log('setUsageBadgeError');
    chrome.browserAction.setBadgeText({
      text: String('error')
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: [255, 0, 0, 255]
    });
  };

  this.notify = function() {
    // Create a simple text notification:
    var pattern = /(\d{2})/g
    var target = dog._monthlyCap / dog._currentUsage * 10;
    var results = pattern.exec(target);
    var percentage = results[1] || 0;
    if(percentage >= 70) {
      var message = 'You have used ' + percentage + '% of your monthly alloment.';
      var notification = webkitNotifications.createNotification(
        '48x48.png',  // icon url - can be relative
        'Usage Alert!',  // notification title
        message
      );
      notification.show();
    }
  };

  this.setBadge = function(text) {
    var pattern = /Current\sUsage:\s\<\/strong\>(\d*)\.\d\sGB\/(\d*)\sGB\<\/td\>/g;
    var results = pattern.exec(text);
    if(results) {
      dog._currentUsage = results[1];
      dog._monthlyCap = results[2];
      dog.setUsageBadge();
    } else {
      dog.setUsageBadgeError();
      dog.unsetLocalStoragePassword();
    }
  };

  this.unsetLocalStoragePassword = function() {
    localStorage['password'] = '';
  };

  this.run = function() {
    var email = encodeURIComponent(localStorage['email']);
    var password = encodeURIComponent(localStorage['password']);
    if(email != 'undefined' && password != 'undefined') {
      dog.log(email);
      dog.log(password);
      var url = "https://secure.bendbroadband.com/usage/usage.asp?action=submit&pageID=mbb&subID=hsiu&adct=3";
      var params = 'Submit1=View+Usage&email=' + email + '&password=' + password;
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhr.send(params);
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          //dog.log(xhr.responseText);
          dog.setBadge(xhr.responseText);
        }
      }
    }
  };

  this.init = function() {
    dog.run();
    //if(localStorage['fetchInterval']) ?  = local
    setInterval("dog.run()", 1000*60*60*8);
    setInterval("dog.notify()", 1000*60*60*24);
  };

};
