function Dog() {
  this._DEBUG = 0;
  this._currentUsage = localStorage['usage'];
  this._monthlyCap = localStorage['cap'];
  this._percent = localStorage['percent'];
  this._minute = localStorage['minute'];
  this._supportTelephone = '541-555-1212';

  if(!this._percent) {
    localStorage['percent'] = 99;
  }

  if(!this._minute) {
    localStorage['minute'] = 1440;
  }

  this.log = function(text) {
    if(dog._DEBUG == 1) {
      console.log(text);
    }
  };

  this.setUsageBadge = function(usage) {
    dog.log('setUsageBadge() Current Usage = ' + dog._currentUsage);
    chrome.browserAction.setBadgeText({
      text: String( usage + 'g' )
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
    var usage = localStorage['usage'];
    dog.log("dog.notify(): " + usage);

    var cap = localStorage['cap'];
    dog.log("dog.notify(): " + cap);

    var percent = localStorage['percent'];
    dog.log("dog.notify(): " + percent );

    var target = cap / usage * 10;
    var pattern = /(\d{1,2})/g
    var results = pattern.exec(target);
    dog.log("dog.notify(): " + results);

    var percentage = results ? results[1] : 0;
    dog.log("dog.notify(): " + percentage);

    if(percentage >= percent) {
      var message = 'You have used ' + percentage + '% of your monthly alloment. Feel free to call ' + dog._supportTelephone + ' and increase your usage by upgrading your account.';
      dog.log("this.notify(): " + message);
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
      localStorage['usage'] = results[1];
      localStorage['cap'] = results[2];
      dog._currentUsage = results[1];
      dog._monthlyCap = results[2];
      dog.setUsageBadge(dog._currentUsage);
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
    var usage = localStorage['usage'];
    dog.log("dog.run(): " + email + "," + password + "," + usage);
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
          dog.log(xhr.responseText);
          dog.setBadge(xhr.responseText);
        }
      }
    }
  };

  this.init = function() {
    dog.run();
    var minute = localStorage['minute'];
    dog.log("dog.init(): " + minute)
    //if(localStorage['fetchInterval']) ?  = local
    setInterval("dog.run()", 1000*60*60*8);
    setInterval("dog.notify()", 1000*60*minute);
  };
};
