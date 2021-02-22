import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, render, fireEvent, screen } from '@testing-library/react';
import Add from '../add';
import words from './words';
import createMatchMedia from './createMatchMedia';

let calledUrls = null;
beforeEach(() => {
  calledUrls = [];
  window.matchMedia = createMatchMedia(900);
  jest.spyOn(global, 'fetch').mockImplementation((url) => {
    const response = { patterns: [], words };
    calledUrls.push(url);
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(response),
    });
  });
});

const renderAdd = () => {
  render(
    <MemoryRouter>
      <Add />
    </MemoryRouter>
  );
};

test.each([
  ['aaa', 'aaa', ''],
  ['ほたるび [蛍火', '蛍火', 'ほたるび'],
  ['ほたるび [蛍火]', '蛍火', 'ほたるび'],
  ['西尾 維新（にしお いしん', '西尾維新', 'にしお いしん'],
  ['西尾 維新（にしお いしん）', '西尾維新', 'にしお いしん'],
])('move down', (input, word, yomigana) => {
  renderAdd();
  const { getByLabelText, getByPlaceholderText } = screen;

  const textField = getByPlaceholderText('Search Palabra');
  fireEvent.change(textField, { target: { value: input } });

  fireEvent.click(getByLabelText('from search'));

  expect(getByLabelText('word').value).toBe(word);
  expect(getByLabelText('yomigana').value).toBe(yomigana);
});

test.each([
  ['aaa', 'aaa', ''],
  ['bbb[aaa', 'aaa', 'bbb'],
])('move up', async (input, word, yomigana) => {
  renderAdd();
  const { getByLabelText, getByPlaceholderText } = screen;

  fireEvent.change(getByLabelText('word'), { target: { value: word } });
  fireEvent.change(getByLabelText('yomigana'), { target: { value: yomigana } });

  await act(async () => {
    fireEvent.click(getByLabelText('to search'));
  });

  const textField = getByPlaceholderText('Search Palabra');
  expect(textField.value).toBe(input);
  expect(calledUrls.length).toBe(1);
  expect(calledUrls[0]).toBe(`/api/search/${input}`);
});

test.each([
  ['aaa', 'aaa', ''],
  ['ほたるび [蛍火', '蛍火', 'ほたるび'],
  ['ほたるび [蛍火]', '蛍火', 'ほたるび'],
  ['西尾 維新（にしお いしん', '西尾維新', 'にしお いしん'],
  ['西尾 維新（にしお いしん）', '西尾維新', 'にしお いしん'],
])('move down then clear', (input, word, yomigana) => {
  renderAdd();
  const { getByLabelText, getByPlaceholderText } = screen;

  const textField = getByPlaceholderText('Search Palabra');
  fireEvent.change(textField, { target: { value: input } });

  fireEvent.click(getByLabelText('from search'));

  const wordInput = getByLabelText('word');
  const yomiganaInput = getByLabelText('yomigana');

  expect(wordInput.value).toBe(word);
  expect(yomiganaInput.value).toBe(yomigana);

  fireEvent.click(getByLabelText('clear all'));

  expect(wordInput.value).toBe('');
  expect(yomiganaInput.value).toBe('');
  expect(textField.value).toBe('');
});

test.each([
  ['aaa', 'aaa', ''],
  ['bbb[aaa', 'aaa', 'bbb'],
])('move up then clear', async (input, word, yomigana) => {
  renderAdd();
  const { getByLabelText, getByPlaceholderText } = screen;

  const wordInput = getByLabelText('word');
  const yomiganaInput = getByLabelText('yomigana');

  fireEvent.change(wordInput, { target: { value: word } });
  fireEvent.change(yomiganaInput, { target: { value: yomigana } });

  await act(async () => {
    fireEvent.click(getByLabelText('to search'));
  });

  const textField = getByPlaceholderText('Search Palabra');
  expect(textField.value).toBe(input);
  expect(calledUrls.length).toBe(1);
  expect(calledUrls[0]).toBe(`/api/search/${input}`);

  fireEvent.click(getByLabelText('clear all'));

  expect(wordInput.value).toBe('');
  expect(yomiganaInput.value).toBe('');
  expect(textField.value).toBe('');
});
