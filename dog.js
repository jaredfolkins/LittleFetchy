function Dog() {
  this._DEBUG = 1;
  this._currentUsage = '0';
  this._monthlyCap = '0';

  this.log = function(text) {
    if(this._DEBUG == 1) {
      console.log(text);
    }
  }

  this.setUsageBadge = function() {
    chrome.browserAction.setBadgeText({
      text: String( this._currentUsage + 'g' )
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: [0, 0, 0, 255]
    });
  };

  this.setUsageBadgeError = function() {
    chrome.browserAction.setBadgeText({
      text: String('error')
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: [255, 0, 0, 255]
    });
  };


  this.setBadge = function(text) {
    var pattern = /Current\sUsage:\s\<\/strong\>(\d*)\.\d\sGB\/(\d*)\sGB\<\/td\>/g;
    var results = pattern.exec(text);
    if(results) {
      this._currentUsage = results[1];
      this._monthlyCap = results[2];
      this.setUsageBadge();
    } else {
      this.setUsageBadgeError();
      this.unsetLocalStoragePassword();
    }
  }

  this.unsetLocalStoragePassword = function() {
    localStorage['password'] = '';
  }
  this.run = function() {
    var email = encodeURIComponent(localStorage['email']);
    var password = encodeURIComponent(localStorage['password']);
    if(email != 'undefined' && password != 'undefined') {
      this.log(email);
      this.log(password);
      var url = "https://secure.bendbroadband.com/usage/usage.asp?action=submit&pageID=mbb&subID=hsiu&adct=3";
      var params = 'Submit1=View+Usage&email=' + email + '&password=' + password;
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhr.send(params);
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          var dog = new Dog();
          dog.log(xhr.responseText);
          dog.setBadge(xhr.responseText);
        }
      }
    }
  }

  this.init = function() {
    this.run();
    setInterval("this.run()", 1000*60*60*8);
  }

}
