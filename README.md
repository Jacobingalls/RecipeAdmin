# RecipeAdmin

React admin interface for viewing RecipeKit nutrition data.

## Languages

The interface is available in English, Danish, Spanish, Dutch and Swedish. It follows your
browser's language by default; to pin one, open **Settings → Language** and pick it there.

## Local Development

```bash
npm install
npm run dev
```

Runs at [localhost:3000](http://localhost:3000). Connects to API at `localhost:8080` by default.

Configure via `.env`:
```
VITE_API_BASE_URL=http://localhost:8080
```

## Deploying

Merging to `main` deploys. The Release workflow builds the image for
`linux/amd64` and `linux/arm64`, pushes it to
`ghcr.io/jacobingalls/recipe-admin` as both the new version and `latest`,
points `k8s/base/admin/deployment.yaml` at it, and pushes the version tag.
ArgoCD picks it up from there.

Versions increment the patch number. To cut a minor or major release, run the
Release workflow from the Actions tab and choose the part to increment.

`deploy.sh` does the same thing from a laptop, for when the workflow can't.

## ArgoCD

Kubernetes manifests in `k8s/`. Uses Kustomize with production overlay.

Create the ArgoCD Application:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: recipe-admin
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/Jacobingalls/RecipeAdmin.git
    targetRevision: main
    path: k8s/overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: recipe
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

Validate manifests:

```bash
kubectl kustomize k8s/overlays/production
```
