---
title: 'Structuring React: Containers and UI Components'
date: '2023-06-23'
description: 'Separate your UI and non-UI concerns with Containers and UI components.'
publish: true
tags: intermediate,react,typescript
---

Containers and UI components is a tried and true method of structuring your React code
in a scalable, cleanly separated way. Here are some reasons to use Containers
and UI components in your codebase:

- Clean separation of non-UI data fetching code from pure UI code
- Promotes code that is easier to unit test
- Containers are transparent, and easy to opt into
- Provides common convention for structuring code

If you are not following the structure of Containers and UI components, you might
have a component that looks like this:

```tsx
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex, Text } from 'design-system';
import { ErrorPage } from 'components/Errors';
import { Loader } from 'components/Loader';
import { useFetchUsers } from 'hooks/useFetchUsers';

function UsersList() {
  const { t } = useTranslation();
  const { users, isError, isLoading } = useFetchUsers();

  const activeUsers = useMemo(
    () => users.filter((user) => user.active),
    [users],
  );

  if (isError) {
    return <ErrorPage />;
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Flex direction="column">
      <Flex>
        <Flex>{t('firstName', 'First Name')}</Flex>
        <Flex>{t('lastName', 'Last Name')}</Flex>
      </Flex>

      {activeUsers.map((user) => (
        <Flex key={user.id}>
          <Text>{user.firstName}</Text>
          <Text>{user.lastName}</Text>
        </Flex>
      ))}
    </Flex>
  );
}
```

Let's break down all the differen types of code that are in this component.

- Internationalization Translation Hook
- Data Fetching Hook
- Memo'd Computation
- Error State
- Loading State
- User List UI

For such a small component, theres a lot of stuff going on here! Let's think of some
scenarios where this code structure might be inconvenient.

What if I'd like to reuse the User List UI components in another area of my application.
Should I rewrite the UI separately, thereby duplicating the same code? Should I move
the UI components to a separate component so that they can be reused?

What if I need to calculate the active users elsewhere? Should I rewrite the `useMemo`
computation? Should I abstract that computation to a separate hook? Should I include
that computation in the user fetching hook?

What would I need to do to write a unit test for the UI? I need to mock
the translation hook and the user fetching hook. I also need to mock the ErrorPage
and the Loader components if they are complex.

## Container Components

Continuing with the example above, let's rewrite this component as separate Container and UI components.
First, the UI should be pretty straightforward. We can grab every line of code that renders a UI. This
should end up being a pure function most of the time.

### UsersList - UI Component

This is our new UI component, which is a pure function. It takes in some props, and renders a UI. It does
not contain any non-UI code.

```tsx
import { Flex, Text } from 'design-system';
import { ErrorPage } from 'components/Errors';
import { Loader } from 'components/Loader';

interface Props {
  isError: boolean;
  isLoading: boolean;
  t: TranslationFunction;
  users: User[];
}

function UsersList() {
  if (isError) {
    return <ErrorPage />;
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Flex direction="column">
      <Flex>
        <Flex>{t('firstName', 'First Name')}</Flex>
        <Flex>{t('lastName', 'Last Name')}</Flex>
      </Flex>

      {users.map((user) => (
        <Flex key={user.id}>
          <Text>{user.firstName}</Text>
          <Text>{user.lastName}</Text>
        </Flex>
      ))}
    </Flex>
  );
}
```

### UsersListContainer - Container Component

This component contains no UI code, other than eventually returning the UsersList
which is now a pure UI functional component.

```tsx
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFetchUsers } from 'hooks/useFetchUsers';
import UsersList from './UsersList';

function UsersListContainer() {
  const { t } = useTranslation();
  const { users, isError, isLoading } = useFetchUsers();

  const activeUsers = useMemo(
    () => users.filter((user) => user.active),
    [users],
  );

  return (
    <UsersList
      isError={isError}
      isLoading={isLoading}
      t={t}
      users={activeUsers}
    />
  );
}
```

## More is less?

Now you might be looking at this code and thinking, wow, this is a bit more code
than what we originally started with. The original code was nice and tidy, all contained in one file.
Why should I do all this extra scaffolding and write more code?

The reality is that components are never that small and tidy. Have you ever opened a component that is
500+ lines long, half of which is complex hooks and calculations, and the other half is rendering
a UI? This is a very common pattern that I see all the time. You start with a simple component,
and then you need to add some more functionality. It grows and grows until you have a behemoth. Unit tests?
Good luck.

The Container and UI components approach is scalable. It sets up definitions for what a type of component should be.
A component either handles data fetching, form submission/validation, and computations, or it renders a UI. It never
does both!

# Common Pitfalls

## Containers that are not transparent

Continuing with our UsersList/UsersListContainer above, a common mistake that people make is exporting the Container
and using it everywhere, **named as a Container**:

### 🚫 Using components named Container

```tsx
function App() {
  return (
    <PageContainer>
      <NavigationContainer />
      <UsersListContainer />
      <FooterContainer />
    </PageContainer>
  );
}
```

### ✅ Using Containers as regular components

```tsx
function App() {
  return (
    <Page>
      <Navigation />
      <UsersList />
      <Footer />
    </Page>
  );
}
```

### ✅ Index files

Index files are great for this, because they allow you to export Containers without having to expose
the fact that you've got a container. This makes using Container opt-in, because you can start
by exporting the UI component, and if you need to add non-UI code, you can easily layer in a Container
without needing to rename your components everywhere.

**Since containers only provide data internally to their paired UI component, the rest of your application
does not need to know if a component is also a container.**

```tsx
// exporting the ui component
export { default as UsersList } from './UsersList';

// or if you need to add a container

// exporting a container as UsersList
export { default as UsersList } from './UsersListContainer';
```

## Passing Prop Types

A common mistake when writing Container and UI components that need to share props is writing the same
prop types twice. Using typescript interfaces, it is possible to extend from a common interface that
represents props that are shared between the Container and the UI components.

```ts
// props used by the container component
export interface ContainerProps extends SharedProps {
  // filter by active users
  active: boolean;
}

// props used by the ui component
export interface Props extends SharedProps {
  t: TranslationFunction;
  users: User[];
}

// props used by the container and ui components
interface SharedProps {
  variant: 'list' | 'table';
}
```

```tsx
import type { ContainerProps } from './UsersList.types';

function UsersListContainer({ active, ...props }: ContainerProps) {
  const { t } = useTranslation();
  const { users } = useFetchUsers();

  // use the "active" prop in the container
  const users = useMemo(() => {
    if (!active) {
      return users;
    }

    return users.filter((user) => user.active);
  });

  return (
    <UsersList
      // pass through "variant" to UI
      {...props}
      // pass translation function from hook in container
      t={t}
      // pass users, may be active or all users depending on active prop
      users={users}
    />
  );
}
```

### ✅ Use spread operator to pass through shared props

Using the spread operator is very helpful when you have some shared props
that you ultimately need to use in the UI component. By referring to those props
as `...props` in your Container, you are effectively saying: Just pass through
all those props, we don't need them in the Container.

# Conclusion

Hopefully this was a helpful introduction to Containers and UI components. Everything in programming
is a trade-off, and here we are trading off needing to write slightly more code for a more
structured and defined codebase. For smaller projects this may feel like a wasted effort, but as a codebase
grows these types of structured approaches will be very important.

Defining a structure for a codebase, along with using linting/formatting tools, and Typescript is a great
approach to ending up with applications that are maintainable at scale. It is very easy to start a new project
and get running quickly, but maintaining a high quality codebase over many years is a tough effort.

If you enjoyed this post, you might also like these:

[The Power of Mocking in Unit Tests](/blog/mocking-in-unit-tests)  
[Using "useMemo" instead of "useEffect" for computations in React](/blog/react-use-memo)
