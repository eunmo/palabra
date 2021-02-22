import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, render, fireEvent } from '@testing-library/react';
import Search from '../searchRoute';
import words from './words';
import createMatchMedia from './createMatchMedia';

let calledUrls = null;
beforeEach(() => {
  calledUrls = [];
  jest.spyOn(global, 'fetch').mockImplementation((url) => {
    let response = { patterns: [], words: [] };
    if (url === '/api/search/happy') {
      response = { patterns: ['happy'], words };
    }
    calledUrls.push(url);
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(response),
    });
  });
});

const renderSearch = (width) => {
  window.matchMedia = createMatchMedia(width);
  return render(
    <MemoryRouter>
      <Search />
    </MemoryRouter>
  );
};

test('renders search box', () => {
  const { getByRole, getByPlaceholderText } = renderSearch(900);
  expect(getByRole('button', { name: 'search' })).toBeInTheDocument();
  expect(getByRole('button', { name: 'clear search' })).toBeInTheDocument();
  expect(getByPlaceholderText('Search Palabra')).toBeInTheDocument();
});

test('prevents empty query', async () => {
  const { getByRole } = renderSearch(900);
  const submit = getByRole('button', { name: 'search' });

  await act(async () => {
    fireEvent.click(submit);
  });

  expect(calledUrls.length).toBe(0);
});

test('renders search results', async () => {
  const { getAllByRole, getByRole, getByPlaceholderText } = renderSearch(900);
  const textField = getByPlaceholderText('Search Palabra');
  const submit = getByRole('button', { name: 'search' });

  fireEvent.change(textField, { target: { value: 'happy' } });
  await act(async () => {
    fireEvent.click(submit);
  });

  expect(getByRole('table')).toBeInTheDocument();

  const levels = getAllByRole('cell', { name: 'level' });
  const levelTexts = levels.map((l) => l.textContent);
  expect(levelTexts).toStrictEqual(['F1704', 'F1812', 'E1712', 'F1709']);
});

test('renders empty query', async () => {
  const { getByRole, getByPlaceholderText, queryByRole } = renderSearch(900);
  const textField = getByPlaceholderText('Search Palabra');
  const submit = getByRole('button', { name: 'search' });

  fireEvent.change(textField, { target: { value: 'xxx' } });
  await act(async () => {
    fireEvent.click(submit);
  });

  expect(getByRole('heading')).toBeInTheDocument();
  expect(queryByRole('table')).toBe(null);
});
