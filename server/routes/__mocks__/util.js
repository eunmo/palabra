const defaultDate = '2020-07-13T09:00:00.000+09:00';
let mockDate;

function setMockDate(date = undefined) {
  mockDate = date;
}

function getNow() {
  return new Date(mockDate ?? defaultDate);
}

module.exports = { getNow, setMockDate };
