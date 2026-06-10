#!/bin/bash

# Bump patch version
CURRENT=$(cat package.json | grep '"version"' | head -1 | awk -F'"' '{print $4}')
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"
PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$PATCH"
sed -i "s/\"version\": \"$CURRENT\"/\"version\": \"$NEW_VERSION\"/" package.json
echo "Bumped version: $CURRENT -> $NEW_VERSION"

VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

# Check npm auth, login if needed
npm whoami 2>/dev/null || npm login

npm run build
git add -A
git commit -m "$VERSION"
git push origin main;
git tag $VERSION;
git push origin $VERSION;
npm publish --access=public
