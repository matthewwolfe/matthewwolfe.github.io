---
title: 'The Power of Mocking in Unit Tests'
date: '2023-06-16'
description: 'Strategies for mocking code so that it is straightforward to unit test.'
publish: true
tags: intermediate,react,typescript
---

Testing is often an afterthought when writing code. It can be confusing, slow down development,
and if implemented poorly provides questionable utility. The following are some tips for
preemptively writing and structuring your code so that it is easy to unit test.

## Mocking Test Boundaries

When using React, composition is key. This often means that if you want to test a component,
you will by default by rendering all of the children of that component. This can be problematic
in a large application where you can end up rendering dozens or even hundreds of components.

Here is an example of a component that we want to write a unit test for. It is a Search component
that contains a search input, a button that triggers the search, and a component that is the
list of all search results.

```tsx
import { SearchInput } from 'components/SearchInput';
import { SearchResults } from 'components/SearchResults';

interface Props {
  search: () => void;
}

function Search({ search }: Props) {
  return (
    <Flex>
      <SearchInput />
      <Button data-testid="search-button" onClick={() => search()}>
        Search
      </Button>

      <SearchResults />
    </Flex>
  );
}
```

Since `SearchInput` and `SearchResults` are separate components, ideally the unit
tests for those should be written separately. This leaves us with testing
the button to make sure that when it is clicked, the `search` function is called.
We don't want to render the other components, otherwise they may potentially fail
the unit test and we wouldn't know if the `Search` component caused the failure,
or if it was caused by another component deeper down the component tree.

Using module mocking we can prevent the search input and search results from rendering
so that we can write a unit test that only deals with the search button. The following
snippet uses Jest's `mock` function to render stubbed components with a test-id.

```tsx
jest.mock('components/SearchInput', () => ({
  SearchInput: () => <div data-testid="search-input" />,
}));

jest.mock('components/SearchResults', () => ({
  SearchResults: () => <div data-testid="search-results" />,
}));
```

Now, when we render our `Search` component, we end up with something that looks like this:

```tsx
<Flex>
  <div data-testid="search-input" />
  <Button data-testid="search-button" onClick={() => search()}>
    Search
  </Button>

  <div data-testid="search-results" />
</Flex>
```

At this point it is very easy to write a unit test that checks the `search` function is called
when the button is clicked.

```tsx
// provide a mocked function for the search prop
const props = {
  search: jest.fn(),
};

const { getByTestId } = render(<Search {...props} />);

// find the button by test id
const button = getByTestId('search-button');

// fire a click event for the button
fireEvent.click(button);

// check that the search prop has been called 1 time
expect(props.search).toHaveBeenCalledTimes(1);
```

## Mocking Environment Variables

If you structure your fetching code in React hooks, you will probably end up
with hooks that look like this:

```tsx
async function fetchUsers() {
  const response = await fetch(`${process.env.API_BASE_URL}/users`);
  return await response.json();
}

function useFetchUsers() {
  // using react-query
  return useQuery(['users'], () => fetchUsers());
}
```

It can be annoying to mock environment variables like `process.env.API_BASE_URL`.
A better way to structure this code is to have a separate file for environment
variables that you can import as a module.

Environment variables module:

```tsx
// config/constants.ts
export const API_BASE_URL = process.env.API_BASE_URL || '';
```

Then you can update the `fetchUsers` function to look like this:

```tsx
import { API_BASE_URL } from 'config/constants';

async function fetchUsers() {
  const response = await fetch(`${API_BASE_URL}/users`);
  return await response.json();
}
```

With this setup, it is very easy to use `jest.mock` to change the value of `API_BASE_URL`
to whatever you'd like, and skip needing to fiddle with mocking `process.env` values.

```tsx
jest.mock('config/constants', () => ({
  API_BASE_URL: 'whatever-value-youd-like',
}));
```

## Use Props Instead of Complex Code Directly in UI Components

When creating a UI in React, it is often tempting to grab any hooks or values that you need
and include them alongside your UI components. This becomes very annoying when writing unit
tests because you'll find that you need to mock a bunch of different modules and functionality
before you can render your UI. It is much easier to separate your components so that your UI
component accepts all of the props it needs to render the UI as a pure function.

### 🚫 Including _everything_ in the UI component

```tsx
function UsersList() {
  // translation hook for i18n
  const { t } = useTranslation();

  // hook to fetch users
  const { users, isLoading, isError } = useFetchUsers();

  return (
    <Flex direction="column">
      <Flex>
        <Flex>{t('firstName', 'First Name')}</Flex>
        <Flex>{t('lastName', 'Last Name')}</Flex>
      </Flex>

      {users.map((user) => (
        <Flex key={user.id}>
          <Flex>{user.firstName}</Flex>
          <Flex>{user.lastName}</Flex>
        </Flex>
      ))}
    </Flex>
  );
}
```

### ✅ Passing props to a pure UI component

```tsx
interface Props {
  t: TranslationFunction;
  users: User[];
  isLoading: boolean;
  isError: boolean;
}

function UsersList({ t, users, isLoading, isError }: Props) {
  return (
    <Flex direction="column">
      <Flex>
        <Flex>{t('firstName', 'First Name')}</Flex>
        <Flex>{t('lastName', 'Last Name')}</Flex>
      </Flex>

      {users.map((user) => (
        <Flex key={user.id}>
          <Flex>{user.firstName}</Flex>
          <Flex>{user.lastName}</Flex>
        </Flex>
      ))}
    </Flex>
  );
}
```

With the UI component set up like this, it is very easy to write different testing scenarios
by tweaking the props that are passed.

```tsx
const baseProps = {
  t: mockTranslationFn(),
  users: [],
  isLoading: false,
  isError: false,
};

test('when loading', () => {
  const props = {
    ...baseProps,
    isLoading: true,
  };

  // render the UI component...
});

test('when error', () => {
  const props = {
    ...baseProps,
    isError: true,
  };

  // render the UI component...
});

test('when users', () => {
  const props = {
    ...baseProps,
    users: [{ id: 1, firstName: 'test', lastName: 'user' }],
  };

  // render the UI component...
});
```

This setup is part of a larger strategy of structuring your React code as separate
Container and UI components. I will discuss this topic in a future blog post.

## Mock Implementations

Sometimes it is not enough to mock a module. Instead, you'd like to mock a module and have
multiple implementations of that module to test different scenarios. Lets say we have a hook
that fetches users and returns an array of users and some loading and error state.

```tsx
import { useFetchUsers } from 'hooks/useFetchUsers';

function ContainerComponent() {
  // we need to mock this hook
  const { users, isLoadingUsers, isErrorUsers } = useFetchUsers();
}
```

Lets start by using `jest.mock` to mock the module.

```tsx
jest.mock('hooks/useFetchUsers');
```

By default, jest will mock the module, but it won't provide us with useful return values
to write unit tests against. In order to do that, we need to set up different mock implementations
of the hook.

```tsx
jest.mock('hooks/useFetchUsers');

import { useFetchUsers } from 'hooks/useFetchUsers';

// necessary for Typescript to understand this is a mock
const mockedUseFetchUsers = jest.mocked(useFetchUsers);

test('when returns users', () => {
  mockedUseFetchUsers.mockReturnValue({
    // return users
    users: [{ id: 1, firstName: 'test', lastName: 'user' }],
    isFetchingUsers: false,
    isErrorUsers: false,
  });

  // write a test against this scenario
});

test('when error', () => {
  mockedUseFetchUsers.mockReturnValue({
    users: [],
    isFetchingUsers: false,
    // error is true
    isErrorUsers: true,
  });

  // write a test against this scenario
});
```

These are just some of the many things you can do with mocking when writing unit tests. Hopefully
these tips help you to write better unit tests!
