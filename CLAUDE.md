# my-hono-project

## Stack
- TypeScript, Node.js 22+, Hono.
- CommonJS (sem `"type": "module"` no package.json).
- `tsconfig.json` usa `"module": "commonjs"` + `"esModuleInterop": true`.
- Build via `tsc` puro (sem bundler) — `tsc` compila para `dist/` e `node dist/index.js` roda direto.

## Convenções de import/export
- Nunca adicionar extensão `.js` nos imports relativos.
  - Correto: `import { UserService } from '../services/user.service'`
  - Errado: `import { UserService } from '../services/user.service.js'`
- Em CommonJS o Node resolve `require()` sem precisar de extensão, e o `tsc` transpila `import`/`export` para `require()`/`module.exports` no output — por isso não é necessário (nem correto) escrever `.js` no código-fonte.
- No código-fonte, sempre escrever `import`/`export` (nunca `require()`/`module.exports` diretamente) — a transpilação para CommonJS é feita pelo `tsc`.

## Scripts
- `dev`: `tsx watch src/index.ts`
- `typecheck`: `tsc --noEmit`
- `build`: `tsc` (emite para `dist/`)
- `start`: `node dist/index.js`

## Package manager
- Usar somente `yarn` neste projeto (não usar `npm`).
