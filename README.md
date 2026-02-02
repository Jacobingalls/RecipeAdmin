# RecipeAdmin

React admin interface for viewing RecipeKit nutrition data.

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

Build and push Docker image:

```bash
docker build -t ghcr.io/jacobingalls/recipe-admin:0.0.1 .
docker push ghcr.io/jacobingalls/recipe-admin:0.0.1
```

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
