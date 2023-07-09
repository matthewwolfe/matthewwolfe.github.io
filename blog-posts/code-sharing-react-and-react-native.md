---
title: 'Reflecting on Code Sharing Between React and React Native'
date: '2023-06-09'
description: 'Looking back at what was easy to share between Native and Web applications, and some simple strategies to make things easier'
publish: true
tags: intermediate,react,react native,react query,typescript
---

One of my favorite parts of the Javascript ecosystem is the opportunity for sharing code
between different types of deployments: Web, Native, Desktop, Backend. Here are some
reflections on building a moderately sized application using React and React Native.

## Don't try to share UI code

There are efforts in the React/React Native community to write components once
and render them natively and for the web, ie: [React Native Web](https://necolas.github.io/react-native-web/).

When thinking about responsive web components in React, it is already a lot of overhead to
make a website that looks good at mobile/tablet/desktop breakpoints. Considerations for UI
and layout on desktop are completely different from a mobile experience. As such, it is not
incredibly useful to try to have a single UI that looks great on web and mobile. I found
that as long as I am able to reuse most of my non-UI code, I could compose UIs very quickly
while also having the freedom to make applications that look great on desktop and native.

Here is a list of non-UI code that I found incredibly useful to share:

- Non-UI components
- Request hooks ([React Query](https://github.com/TanStack/query))
- Schemas for validation ([Zod](https://github.com/colinhacks/zod))
- Stores ([Zustand](https://github.com/pmndrs/zustand))
- Typescript types
- Utils (String/Date formatting, Generic functions)

## Requests will be different

For my project, I used [React Query](https://github.com/TanStack/query) extensively. If you are
unfamiliar with React Query, it's a hook based library for making requests, and it has a ton of
configuration for caching data, refetching, background actions, and much more.

#### Caching requests

In the web and native versions of the application, I preferred a Query Client configuration that fetched
any requests for a page every time that page loaded. This ensured that when a user viewed any
page, they always had the most up to date information. My Query Client setup looked like this:

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      // refetch requests when mounting (page loads for the first time)
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      // keep the fetched requests forever in cache to prevent unnecessary refetching
      staleTime: Infinity,
    },
  },
});
```

This setup essentially says that requests should be fetched once per page load, and then cached forever.
If I needed to make an update to cached data, it was very easy to call `client.invalidateQueries` to
force a request to be refetched. This worked great for having dependent data be updated after a successful
POST request.

#### Refetching for native

Many native applications use a "pull to refresh" pattern for updating the content in the current view.
React Query made it very easy to expose a `refetch` function as part of the request hooks that I could
call from React Native's `ScrollView` "refreshControl" prop.

```tsx
<ScrollView
  refreshControl={
    <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
  }
>
  {/* your content */}
</ScrollView>
```

This `refetch` functionality remained unused in the web version of the application, but since
it is just one more property to expose from React Query's `useQuery` hook, it made it really
easy to use the refetch functionality when I needed it in the native application.

## Use a Monorepo

I used [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces) to create
a pretty simple package structure that looked like this:

```bash
/packages
  /native
  /shared
  /web
```

The "native" package contained the React Native/Expo codebase. The "web" package contained
the Nextjs codebase. The "shared" package contained all of the code that was shared between
web and native. However, I let the web and native applications handle the compilation/transpilation
of the shared package, without having to jump through the hoops of needing to build the shared
package in a way that it was compatible with web and native targets.

#### Web (Nextjs)

Using the [transpilePackages](https://nextjs.org/docs/app/api-reference/next-config-js/transpilePackages)
configuration, it was very easy to have the shared package be built in exactly the same
way that the rest of the web application was built.

```ts
// next.config.js
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['shared'],
};
```

#### Native (React Native/Expo)

React Native with Expo/Metro was a bit more tricky, but by using the `extraNodeModules` property
in the Expo/Metro configuration I was able to add the "shared" package as an additional
node modules directory so that it would get compiled/transpiled with the rest of the React
Native application.

## Use Context/Providers for Equivalent Functionality With Different Implementations

In React Native, interacting with native storage is asynchronous using the [Async Storage](https://github.com/react-native-async-storage/async-storage) library. This is in contrast to using
Session/Local Storage or cookies in a web environment, which is always synchronous.

In my project, I wanted to store a JWT token as a cookie for the web application so that
it was easily accessible on the frontend and backend, for cases where I wanted to use
the SSR features of Nextjs. Cookies aren't a thing in React Native, which prefers
having all storage set with the Async Storage API.

A solution to this problem is to create shared Context/Providers that have the exact same
contract, but have different implementation details depending on the environment.

For example, I wrote an Auth Context/Provider that looked like this:

```tsx
<AuthContext.Provider
  value={{
    clearToken: clearAuthToken,
    setToken: setAuthToken,
    token,
  }}
>
  {children}
</AuthContext.Provider>
```

The Native and Web environments were able to specify their own implementation of those
functions. In the Native environment, `clearToken`, `setToken`, and `token` interact
with the Async Storage API. In the Web environment, those values are created by
interacting with a Web-specific Cookie library.

With this Context that implemented a shared interface, it became really easy
to write request hooks that need to send a token as part of the API request
without needing to conditionally check if the request is being sent from a Native
or Web environment. The request hooks don't care where the token comes from,
they just need a token to be available to send when making API requests.

```tsx
function useFetchData() {
  const { token } = useContext(AuthContext);

  // make an authenticated request
}
```

Another example of this is environment variables. Just about every flavor of React
application (CRA, Nextjs, Vite, React Native, etc) handle environment variables
differently. Nextjs requires that environment variables be prefixed with `NEXT_PUBLIC_`.
Vite uses `import.meta.env`.

Having a Context/Provider to specify environment variable values allowed papering over
the subtle differences in how environment variables must be structured in different projects.

#### Nextjs

```tsx
<EnvVarsContext.Provider
  value={{
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  }}
>
  {children}
</EnvVarsContext.Provider>
```

#### Vite

```tsx
<EnvVarsContext.Provider
  value={{
    BASE_URL: import.meta.env.BASE_URL,
  }}
>
  {children}
</EnvVarsContext.Provider>
```

#### React Native

```tsx
<EnvVarsContext.Provider
  value={{
    BASE_URL: process.env.BASE_URL,
  }}
>
  {children}
</EnvVarsContext.Provider>
```

#### In shared code

```tsx
function SharedComponent() {
  const { BASE_URL } = useContext(EnvVarsContext);
}
```

## Conclusion

- Non UI Code is easy to share
- UI Code is so different for Native and Web that it is worth it to write separately
- Monorepo makes it easy to segment buckets of code
- Use Context to define common interfaces that have different implementation details
