# Ginger

A simple recipe manager to learn React, Redux, GraphQL, TypeORM, and testing.

## Setup

- `npm install`
- `npm run backend-dev` and `npm run frontend-dev` for development
- `npm run test` to test

## To-do:

- Basic functionality
  - Recipes
    - Delete, edit
  - Lists (popular, new)
- Make it offline (https://create-react-app.dev/docs/making-a-progressive-web-app/)
- Potential future problems
  - Make bookmarking retrieve and save the entire recipe so it's really all offline
  - Disable body scroll (with `body-scroll-lock`, very small bundle size) when a RecipeView is showing
- Optimization, when most everything else is done:
  - Watch the bundle size (https://create-react-app.dev/docs/analyzing-the-bundle-size/)
  - Replace React with Preact
  - Replace Apollo with something lighter
  - Code splitting on tabs
