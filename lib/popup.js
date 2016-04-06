// Saves options to localStorage.
function save_options() {

  var email_field = document.getElementById("email");
  localStorage["email"] = email_field.value;

  var password_field = document.getElementById("password");
  localStorage["password"] = password_field.value;

  var percent_select = document.getElementById("percent");
  var percent = percent_select.children[percent_select.selectedIndex].value;
  localStorage["percent"] = percent;

  var minute_select = document.getElementById("minute");
  var minute = minute_select.children[minute_select.selectedIndex].value;
  localStorage["minute"] = minute;

  var debug_select = document.getElementById("debug");
  var debug = debug_select.children[debug_select.selectedIndex].value;
  localStorage["debug"] = debug;

  // Update status to let user know options were saved.
  var status = document.getElementById("status");

  status.innerHTML = '<div style="color:#FF8700"><strong>Options Saved</strong></div>';
  setTimeout(function() {
    status.innerHTML = "<br />";
  }, 2000);

  //get background.html and make the dog object run
  var background = chrome.extension.getBackgroundPage();
  background.notifier();
}

// Restores select box state to saved value from localStorage.
function restore_options() {

  var usage = localStorage['usage'];
  var cap = localStorage['cap'];
  var email = localStorage["email"];
  var password = localStorage["password"];
  var percent = localStorage["percent"];
  var minute = localStorage["minute"];
  var debug = localStorage["debug"];

  console.log('restore_options');

  if (usage) {
    var udiv = document.getElementById("usage");
    udiv.innerHTML = usage;
  }

  if (cap) {
    var cdiv= document.getElementById("cap");
    cdiv.innerHTML = cap;
  }

  if (email) {
    var email_field = document.getElementById("email");
    email_field.value = email;
  }

  if (password) {
    var password_field = document.getElementById("password");
    password_field.value = password;
  }

  if (percent) {
    var select = document.getElementById("percent");
    for (var i = 0; i < select.children.length; i++) {
      var child = select.children[i];
      if (child.value == percent) {
        child.selected = "true";
      }
    }
  }

  if (minute) {
    var select = document.getElementById("minute");
    for (var i = 0; i < select.children.length; i++) {
      var child = select.children[i];
      if (child.value == minute) {
        child.selected = "true";
      }
    }
  }

  if (debug) {
    var select = document.getElementById("debug");
    for (var i = 0; i < select.children.length; i++) {
      var child = select.children[i];
      if (child.value == debug) {
        child.selected = "true";
      }
    }
  }
}

function refresh() {
  var status = document.getElementById("status");

  status.innerHTML = '<div style="color:#FF8700"><strong>Fetching Data</strong></div>';
  setTimeout(function() {
    status.innerHTML = "<br />";
  }, 2000);
  //get background.html and make the dog object run
  var background = chrome.extension.getBackgroundPage();
  background.dog.run();
}

document.addEventListener('DOMContentLoaded', function () {
  restore_options();
  var element_save = document.getElementById("save");
  element_save.addEventListener("click", function(){ save_options() }, false);
});

document.addEventListener('DOMContentLoaded', function () {
  restore_options();
  var element_save = document.getElementById("refresh");
  element_save.addEventListener("click", function(){ refresh() }, false);
});

