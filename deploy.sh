#! /bin/bash -e

# Local break-glass deploy. The normal path is .github/workflows/release.yml,
# which runs this same sequence on every merge to main.

container="ghcr.io/jacobingalls/recipe-admin"
manifest="k8s/base/admin/deployment.yaml"

if [ -z "$1" ]; then
	# Get the latest bare semver tag (X.Y.Z), sorted by version
	latest=$(git tag -l | grep -E '^[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -1)
	if [ -z "$latest" ]; then
		version="0.0.1"
	else
		# Split on '.', increment patch
		IFS='.' read -r major minor patch <<< "$latest"
		version="$major.$minor.$((patch + 1))"
	fi
	echo "Auto-incrementing version: $latest → $version"
else
	version="$1"
fi

# Ensure there are no uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
	echo "Error: There are uncommitted changes. Please commit or stash them before deploying."
	exit 1
fi

git_commit=$(git rev-parse --short HEAD)
docker buildx build --platform linux/amd64,linux/arm64 --build-arg VERSION=$version --build-arg GIT_COMMIT=$git_commit -t $container:$version -t $container:latest --push .

# Update k8s deployment with new version. Written via a temp file so the same
# invocation works with both BSD and GNU sed.
tmp=$(mktemp)
sed "s|image: $container:.*|image: $container:$version|" "$manifest" > "$tmp"
mv "$tmp" "$manifest"

# Commit, tag, and push
git add "$manifest"
git commit -m "Deploy $version"
git tag "$version"
git push
git push origin "$version"
