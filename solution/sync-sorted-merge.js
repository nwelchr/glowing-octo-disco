"use strict";

// Print all entries, across all of the sources, in chronological order.

const PriorityQueue = require("js-priority-queue");
const { SinglyLinkedList } = require("linked-list-typed");

module.exports = (logSources, printer) => {
  const logSourceHeap = new PriorityQueue({
    comparator: (a, b) =>
      a.logEntries.head.value.date - b.logEntries.head.value.date,
  });

  const initializeHeap = () => {
    logSources.map((logSource) => {
      const logEntries = new SinglyLinkedList();
      const logEntry = logSource.pop();
      logEntries.push(logEntry);
      logSourceHeap.queue({ logSource, logEntries });
    });
  };

  const processLogs = () => {
    while (logSourceHeap.length > 0) {
      const { logSource, logEntries } = logSourceHeap.dequeue();
      printer.print(logEntries.shift());
      const logEntry = logSource.pop();
      if (!logSource.drained) {
        logEntries.push(logEntry);
        logSourceHeap.queue({ logSource, logEntries });
      }
    }
  };

  initializeHeap();

  processLogs();

  printer.done();

  return console.log("Sync sort complete.");
};
