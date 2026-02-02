#! /bin/bash

container="ghcr.io/jacobingalls/recipe-admin"
version="$1"

if [ "$version" == "" ]; then
	echo "Usage: $0 <version>"
	exit 1
fi

docker build --ssh default --platform linux/amd64,linux/arm64 -t $container:latest .
docker image tag $container:latest $container:$version
docker push $container:$version
docker push $container:latest

# Update k8s deployment with new version
sed -i '' "s|image: $container:.*|image: $container:$version|" k8s/base/admin/deployment.yaml
