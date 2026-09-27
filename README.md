# BlogNest API

Express and MongoDB backend for blog drafts, approval, comments, media paths, and Gemini-assisted writing. The Next.js app in the parent folder is separate. Run this API from the `Server` directory.

macOS often reserves port 5000, so the default port is **5050**.

## Setup

Requirements: Node.js 20 or newer, npm 8 or newer, and MongoDB.

```bash
cd Server
cp env.example .env
npm install
```

Set `JWT_SECRET` in `.env` to a random string of at least 32 characters. Add `GEMINI_API_KEY` when you want `/api/ai/*` to call Gemini. The model is `gemini-3.8-flash`. Step-by-step Postman checks, including the AI content request, are in [docs/api-testing.md](docs/api-testing.md).

Start MongoDB, then:

```bash
npm run seed
npm start
```

`npm run dev` restarts the server with nodemon. Health check: `GET http://localhost:5050/api/health`.

## Roles

| Role | Access |
| --- | --- |
| admin | Users, roles, logs, everything an editor can do |
| editor | Approval queue, publish or schedule, categories, tags, comment moderation |
| author | Own drafts, submit for approval, media paths, own analytics |
| reader | Published posts, comments, likes |

The first account created on an empty database becomes admin. Later public registrations are readers. Admins create other roles with `POST /api/users`.

Seed accounts (local demo only):

- `admin@blognest.dev` / `Admin@12345`
- `editor@blognest.dev` / `Editor@12345`
- `author@blognest.dev` / `Author@12345`
- `reader@blognest.dev` / `Reader@12345`

Send the login token as `Authorization: Bearer <token>`.

## Postman checks

These screenshots are from a local run at `http://127.0.0.1:5050`. The same steps, plus the AI content request, are written out in [docs/api-testing.md](docs/api-testing.md).

### Register

`POST /api/auth/register` with `name`, `email`, and `password` returns **201** and a token.

![Register user john and the 201 response](docs/images/01-register.jpg)

### Login

`POST /api/auth/login` with email and password returns **200** and a token.

![Login as the seeded author and the 200 response](docs/images/02-login.jpg)

### Create a blog

`POST /api/blogs` with `title`, `content`, and `category`, plus `Authorization: Bearer <token>`, returns **201**.

![Create blog request and the start of the 201 response](docs/images/03-create-blog.jpg)

![Published blog response, including the Technology category](docs/images/04-create-blog-response.jpg)

## Blog workflow

Statuses are `draft`, `pending`, `scheduled`, and `published`.

Authors can create drafts or submit `pending`. Editors and admins publish immediately or set `scheduled` with a future `scheduledAt`. Due scheduled posts are published when posts are listed or fetched. An author who edits a live post sends it back to `pending`.

`name` is the title and `message` is the body. `title` and `content` are accepted as aliases.

## Main routes

| Method | Path | Who |
| --- | --- | --- |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Signed in |
| GET, POST | `/api/users` | Admin |
| PATCH | `/api/users/:id/role` | Admin |
| DELETE | `/api/users/:id` | Admin |
| GET | `/api/posts` | Public, published only |
| GET | `/api/posts/mine` | Author, editor, admin |
| GET | `/api/posts/queue` | Editor, admin |
| POST | `/api/posts` | Author, editor, admin |
| GET | `/api/posts/:id` | Public if published |
| PUT | `/api/posts/:id` | Owner, editor, admin |
| PATCH | `/api/posts/:id/status` | Owner for draft/pending; editor and admin for any status |
| POST | `/api/posts/:id/like` | Signed in |
| DELETE | `/api/posts/:id` | Owner, editor, admin |
| GET, POST | `/api/posts/:postId/comments` | Read approved comments; signed-in users can comment |
| PATCH | `/api/comments/:id` | Editor, admin (`pending`, `approved`, `spam`) |
| DELETE | `/api/comments/:id` | Owner, editor, admin |
| GET | `/api/categories`, `/api/tags` | Public |
| POST, DELETE | `/api/categories`, `/api/tags` | Editor, admin |
| GET, POST, DELETE | `/api/media` | Author, editor, admin |
| GET | `/api/analytics/overview` | Editor, admin |
| GET | `/api/analytics/posts/:id` | Owner, editor, admin |
| GET | `/api/search?q=` | Public published posts |
| GET | `/api/admin/logs` | Admin |
| POST | `/api/ai/generate-blog` | Author, editor, admin |
| POST | `/api/ai/summarize` | Signed in |
| POST | `/api/ai/faq` | Signed in |
| POST | `/api/ai/weatherwise` | Signed in |
| POST | `/api/ai/fittrack` | Signed in |

List routes accept `page` and `limit` (max 50). Post lists also accept `category` and `tag` slugs, plus `q`.

Generate a draft and store it:

```json
{
  "topic": "How to plan a week of blog drafts",
  "tone": "practical",
  "save": true
}
```

Media registration stores a path. It does not upload a file:

```json
{
  "path": "media/covers/week-plan.jpg",
  "filename": "week-plan.jpg",
  "mimeType": "image/jpeg",
  "alt": "Desk with notes",
  "postId": "<post id>",
  "setAsCover": true
}
```

A Postman collection lives at `postman/BlogNest.postman_collection.json`.
