// everything starts here
var dog = new Dog();
dog.init();

// Data aggregation loop
window.setInterval( function() { dog.run() }, 1000*60*60*8);

// Notifications
var notifyMinute = 1000*60*localStorage["minute"];
var notifier = function() {
  dog.log("notifier()");
  minute = localStorage["minute"];
  notifyMinute = 1000*60*minute;
  dog.log("notifier() dog.minute == " + minute);
  dog.notify();
  notifyWorker = setTimeout(notifier, notifyMinute);
}
var notifyWorker = setTimeout(notifier, notifyMinute);
