#! /bin/bash -e

container="ghcr.io/jacobingalls/recipe-admin"
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
docker build --ssh default --platform linux/amd64,linux/arm64 --build-arg VERSION=$version --build-arg GIT_COMMIT=$git_commit -t $container:latest .
docker image tag $container:latest $container:$version
docker push $container:$version
docker push $container:latest

# Update k8s deployment with new version
sed -i '' "s|image: $container:.*|image: $container:$version|" k8s/base/admin/deployment.yaml

# Commit, tag, and push
git add k8s/base/admin/deployment.yaml
git commit -m "Deploy $version"
git tag "$version"
git push
git push origin "$version"
