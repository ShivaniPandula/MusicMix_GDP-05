function indexedDBStuff () {
    // Check for IndexedDB support:
    if (!('indexedDB' in window)) {
      // Can't use IndexedDB
      console.log("This browser doesn't support IndexedDB");
      return;
    } else {
      // Do IndexedDB stuff here:
      // ...
      console.log("Will work")
    }
  }
  
  // Run IndexedDB code:
  indexedDBStuff();
  