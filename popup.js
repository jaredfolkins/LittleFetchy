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

  // Update status to let user know options were saved.
  var status = document.getElementById("status");

  status.innerHTML = '<div style="color:#FF8700">Options Saved</div>';
  setTimeout(function() {
    status.innerHTML = "";
  }, 2000);

  //get background.html and make the dog object run
  var background = chrome.extension.getBackgroundPage();
  background.dog.notify();
  background.dog.run();
}

// Restores select box state to saved value from localStorage.
function restore_options() {

  var email = localStorage["email"];
  var password = localStorage["password"];
  var percent = localStorage["percent"];
  var minute = localStorage["minute"];

  console.log('restore_options');
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
}

document.addEventListener('DOMContentLoaded', function () {
  restore_options();
  var element_save = document.getElementById("save");
  element_save.addEventListener("click", function(){ save_options() }, false);
});

