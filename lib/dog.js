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

  this.unsetLocalStoragePassword = function() {
    localStorage['password'] = '';
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

  this.getTemplateUrl = function() {
    var isp = localStorage["isp"];
    this.log("dog.getTemplateUrl() isp = " + isp);
    if (isp = "bendbroadband") {
      return chrome.extension.getURL('templates/' + isp + '.js');
    }
  }

  this.setBadge = function(text, isp) {
    this.log("dog.setBadge() isp");
    var re = new RegExp(isp.formRegex, isp.formModifier);
    var results = re.exec(text);
    if(results) {
      localStorage['usage'] = results[1];
      localStorage['cap'] = results[2];
      this._currentUsage = results[1];
      this._monthlyCap = results[2];
      this.setUsageBadge(this._currentUsage);
    } else {
      this.setUsageBadgeError();
    }
  };


  this.run = function() {
    var email = encodeURIComponent(localStorage['email']);
    var password = encodeURIComponent(localStorage['password']);
    var usage = localStorage['usage'];
    this.log("dog.run(): " + email + "," + password + "," + usage);
    if(email != 'undefined' && password != 'undefined') {
      this.scrape(email, password);
    }
  };

  this.scrape = function(email, password) {
    this.log("dog.scrape()");
    this.setUsageBadgeLoading();
    this.request("GET", this.getTemplateUrl())
    .then(function(templateJson) {
      t = JSON.parse(templateJson);
      params = t.userParam + "=" + email + "&" + t.passParam + "=" + password; 
      dog.request("POST", t.postUrl, params)
      .then(function(html){
        dog.setBadge(html, t);
      });
    })
  }

  // this is the primary method used for processing web requests sequentially using promises
  this.request = function(method, url, params) {
    this.log("dog.request() method : " + method + " url : " + url + " params : " + params);
    return new Promise(function(resolve, reject) {

      var xhr = new XMLHttpRequest();
      xhr.open(method, url, true);

      if (method === "POST") {
        dog.log("dog.request() apply content-type");
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      }

      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.responseText);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      };

      xhr.onerror = function() {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };

      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 ) {
          xhr.responseText;
        }
      }

      if (params != null) {
        dog.log("dog.request() send with params");
        xhr.send(params);
      } else {
        dog.log("dog.request() send without params");
        xhr.send();
      }
    });
  }
};
