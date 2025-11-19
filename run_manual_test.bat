rd dist_manual_tests /S /Q
:call npx tsc -p .\tsconfig.manual_tests.json
:node .\dist_manual_tests\manual_tests\dj\django_csfr_token.js

call npx esbuild manual_tests/dj/django_csfr_token.ts --bundle --outdir=rd dist_manual_tests --format=esm


