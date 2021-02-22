const get = (url, callback) => {
  fetch(url)
    .then((response) => response.json())
    .then(callback);
};

const post = (url, body, callback) => {
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(callback);
};

const put = (url, body, callback) => {
  fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(callback);
};

const fetchDelete = (url, body, callback) => {
  fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(callback);
};

const sortWordsByPattern = (patterns, words) => {
  const localeOption = { sensitivity: 'base', ignorePunctuation: true };
  const localeCompare = (a, b) => a.localeCompare(b, 'fr', localeOption) === 0;

  const exact = [];
  const startsWith = [];
  const remainder = [];
  words.forEach((word) => {
    const filtered = patterns.some((pattern) => {
      return ['word', 'yomigana', 'meaning'].some((key) => {
        if (localeCompare(word[key], pattern)) {
          exact.push(word);
          return true;
        }

        if (localeCompare(word[key].slice(0, pattern.length), pattern)) {
          startsWith.push(word);
          return true;
        }

        return false;
      });
    });
    if (!filtered) {
      remainder.push(word);
    }
  });

  return [...exact, ...startsWith, ...remainder];
};

const getYYMM = () => new Date().toISOString().slice(2, 7).replace(/-/, '');

const shuffleIndices = (count) => {
  const array = [...Array(count).keys()];

  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
};

export {
  get,
  post,
  put,
  fetchDelete,
  sortWordsByPattern,
  getYYMM,
  shuffleIndices,
};
