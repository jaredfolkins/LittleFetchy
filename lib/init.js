// Init
var dog = new Dog();
dog.init();

// Data Aggregation Loop
var hour = 1000*60*60;
window.setInterval( function() { dog.run() }, hour);

// Local Notifications
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
