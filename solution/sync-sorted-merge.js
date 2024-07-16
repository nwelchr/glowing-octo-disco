"use strict";

// Print all entries, across all of the sources, in chronological order.

module.exports = (logSources, printer) => {
  const logEntries = [];

  for (const logSource of logSources) {
    let logEntry = logSource.pop();
    while (!logSource.drained) {
      logEntries.push(logEntry);
      logEntry = logSource.pop();
    }
  }

  logEntries.sort((a, b) => a.date - b.date);

  for (const logEntry of logEntries) {
    try {
      printer.print(logEntry);
    } catch (e) {
      console.log(logEntry);
    }
  }

  printer.done();

  return console.log("Sync sort complete.");
};
