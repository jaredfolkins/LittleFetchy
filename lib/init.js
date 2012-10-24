// everything starts here
var dog = new Dog();
dog.init();
// program loop (aka timers)
window.setInterval( function() { dog.run() }, 1000*60*60*8);
window.setInterval( function() { dog.notify() }, 1000*60*dog.minute);
