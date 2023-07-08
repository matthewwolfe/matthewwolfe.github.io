---
title: 'Using "useMemo" instead of "useEffect" for computations in React'
date: '2023-06-07'
description: 'Avoiding the common pitfall of overusing effects in React, and embracing the "useMemo" hook instead.'
tags: beginner,react,typescript
---

One of the most common patterns in a React codebase is taking some information, transforming it,
and displaying that information visually. In this post I will demonstrate a common pitfall when
structuring this type of code that a lot of newcomers to React make: Using `useEffect` to transform
data.

In this example, we have an array of users, each with a first name and an active flag.

```ts
interface User {
  firstName: string;
  active: boolean;
}

const users: User[] = [
  {
    firstName: 'Elvie',
    active: false,
  },
  {
    firstName: 'Janelle',
    active: true,
  },
];
```

In this React component we are going to take the array of users and filter out any inactive users
before displaying a list of all active users.

```tsx
interface Props {
  users: User[];
}

function ActiveUsers({ users }: Props) {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);

  useEffect(() => {
    // filter out all users that are inactive
    const filteredUsers = users.filter((user) => user.active);

    setActiveUsers(filteredUsers);
  }, [users]);

  // render a list of active users
  return (
    <div>
      {activeUsers.map((activeUser, index) => (
        <div key={index}>
          <h1>{activeUser.firstName}</h1>
        </div>
      ))}
    </div>
  );
}
```

Using `useEffect` here is not appropriate because the transformation is not a side effect. It is also
inefficient, requiring an additional render to apply the effect before displaying the active users.

Instead, use the `useMemo` hook to transform the data:

```tsx
interface Props {
  users: User[];
}

function ActiveUsers({ users }: Props) {
  // use "useMemo" to save the calculation
  const activeUsers = useMemo(
    () => users.filter((user) => user.active),
    [users]
  );

  // render a list of active users
  return (
    <div>
      {activeUsers.map((activeUser, index) => (
        <div key={index}>
          <h1>{activeUser.firstName}</h1>
        </div>
      ))}
    </div>
  );
}
```

The Official React documentation has a great page on avoiding effects, [check it out](https://react.dev/learn/you-might-not-need-an-effect).
