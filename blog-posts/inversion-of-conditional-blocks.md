---
title: 'Inversion of Conditional Blocks'
date: '2023-06-08'
description: 'Invert conditional logic to reduce lines of code, reduce nesting, and improve readability'
publish: true
tags: beginner,typescript
---

Let's say we need to write some code that validates a form. We need to ensure that each value is truthy,
or the form validation should fail.

```ts
interface FormValues {
  firstName: string;
  lastName: string;
  age: number;
}

const formValues = {
  firstName: 'Sofia',
  lastName: 'Jacobs',
  age: 25,
};
```

Now lets write a function that validates our values, returning the values
if everything is correct, and throwing an error if any of the values are not set.

```ts
function validate(values: FormValues) {
  const { firstName, lastName, age } = values;

  if (firstName) {
    if (lastName) {
      if (age) {
        return values;
      } else {
        throw new Error('age is empty');
      }
    } else {
      throw new Error('lastName is empty');
    }
  } else {
    throw new Error('firstName is empty');
  }
}
```

This function has three levels of conditional nesting and requires jumping
up and down to different lines to determine what happens if the conditions
are not met. If we invert the conditions, we can reduce the nesting,
eliminate any jumping to evaluate conditions, and drastically improve readability.

```ts
function validate(values: FormValues) {
  const { firstName, lastName, age } = values;

  if (!firstName) {
    throw new Error('firstName is empty');
  }

  if (!lastName) {
    throw new Error('lastName is empty');
  }

  if (!age) {
    throw new Error('age is empty');
  }

  return values;
}
```

Now the function reads from top to bottom, and is segmented so that the failure
logic occurs first, leaving the happy path to be returned at the end of the function.
For larger functions, this can prevent if-statement nesting 4-5 levels deep,
and having to do huge jumps to read code that may not all fit on the same screen.

Being able to read code from top to bottom greatly improves readability and reduces
complexity.

### Disclaimer

This is not how I would actually do form validation. For that, consider using
[Zod](https://zod.dev/), [Yup](https://github.com/jquense/yup), [Joi](https://github.com/hapijs/joi)
or any of the other popular schema validation libraries out there.
