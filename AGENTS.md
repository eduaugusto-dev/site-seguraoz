<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project structure

- Each page's UI lives in its own folder (`src/home/` for the Home: component + CSS); the route file in `src/routes/` only wires `head()` and the component. Why: keeps pages isolated and easy to find.
- Page CSS uses a page-specific class prefix (Home uses `hm-`). Why: route stylesheets stay loaded after client navigation, so generic class names (e.g. login's `.stage`, `.logo`) would leak between pages.
- Desktop pages reproduce the reference mockup on a fixed-size stage scaled with JS; below 900px they switch to a stacked flow layout. Why: pixel fidelity to the design on large screens without horizontal scroll on phones.
- Júpiter chat state and replies live in `src/jupiter/chat.ts`; `askJupiter()` is the single seam for the future FastAPI call and the session history uses sessionStorage. Why: swapping demo replies for the real API touches one function.
