# Documentation for `@groveco/backbone.store`

**Don't commit to this branch!** 

When a PR merges to `master`, CircleCI will run the `docs` job to build and push the docs to this branch. All the commits in the `gh-pages` branch will start with `[skip ci]` so that CircleCI doesn't try to run the rest of the build on _this branch_. The `docs` job will only be run on `master` and tags.

Check [the `.circleci/config.yaml` in `master`](https://github.com/groveco/backbone.store/blob/master/.circleci/config.yml) for how this works. 

**Check out the results at https://groveco.github.io/backbone.store/**

This repo builds GitHub Pages from the `gh-pages` branch, so whenever new docs are built and pushed to `gh-pages`, they'll be deployed to https://groveco.github.io/backbone.store automatically. If you want to see the docs for your current branch, use `npm run build:docs` and serve the `docs/` folder. 

_Just don't push anything to `gh-pages`!_
