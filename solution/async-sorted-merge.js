"use strict";

// Print all entries, across all of the *async* sources, in chronological order.

const PriorityQueue = require("js-priority-queue");
const { SinglyLinkedList } = require("linked-list-typed");

const waitMs = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports = (logSources, printer) => {
  return new Promise(async (resolve, reject) => {
    const logSourceHeap = new PriorityQueue({
      comparator: (a, b) =>
        a.logEntries.head.value.date - b.logEntries.head.value.date,
    });

    const fetchLogsInBackground = async (logSource, logEntries) => {
      let logEntry = await logSource.popAsync();
      while (!logSource.drained) {
        logEntries.push(logEntry);
        logEntry = await logSource.popAsync();
      }
    };

    const initializeHeap = () => {
      return Promise.all(
        logSources.map(async (logSource) => {
          const logEntries = new SinglyLinkedList();
          const logEntry = await logSource.popAsync();
          logEntries.push(logEntry);
          logSourceHeap.queue({ logSource, logEntries });
          fetchLogsInBackground(logSource, logEntries);
        })
      );
    };

    const processLogs = async () => {
      while (logSourceHeap.length > 0) {
        const { logSource, logEntries } = logSourceHeap.dequeue();
        printer.print(logEntries.shift());
        while (!logEntries.head && !logSource.drained) {
          await waitMs(8);
        }
        if (logEntries.head) {
          logSourceHeap.queue({ logSource, logEntries });
        }
      }
    };

    await initializeHeap();

    await processLogs();

    printer.done();

    resolve(console.log("Async sort complete."));
  });
};
