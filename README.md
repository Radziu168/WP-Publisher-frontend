# Uni Frontend — Headless WordPress + Next.js + AI

> 🎬 **[Obejrzyj demo (3 min)](https://www.loom.com/share/b9ebcb12d14543ba8dd4da4cd5f815de)** — system w działaniu: AI generuje eventy, panel admina zatwierdza drafty, publiczny frontend wyświetla dane z WordPress.

Headless CMS zbudowany na Next.js 15 i WordPress. Python pipeline automatycznie generuje treść wydarzeń przez OpenAI API i publikuje drafty do WordPressa. Panel `/admin` pozwala zatwierdzić lub odrzucić każdy draft przed publikacją. Publiczny frontend renderuje blog i eventy przez WPGraphQL.

---

## Architektura systemu

```
┌─────────────────────────────────────────────────────────┐
│                    PYTHON PIPELINE                      |
│                  (ai-wp-publisher/)                     |
│                                                         │
│  events_batch.csv → event_generator.py → OpenAI API     │
│                           ↓                             │
│                     wp_client.py → WordPress REST API   │
│                           ↓                             │
│                    Drafty w wp-admin                    │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   NEXT.JS FRONTEND                      │
│                   (WP-Publisher-frontend/)              │
│                                                         │
│  /admin  → Server Actions → WordPress REST API          │
│            (zatwierdź/odrzuć drafty)                    │
│                                                         │
│  /events → WPGraphQL → WordPress                        │
│  /blog   → WPGraphQL → WordPress                        │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend

| Technologia  | Wersja | Zastosowanie                                |
| ------------ | ------ | ------------------------------------------- |
| Next.js      | 15     | Framework (App Router, Server Actions, ISR) |
| TypeScript   | 5      | Typowanie                                   |
| Tailwind CSS | v4     | Stylowanie                                  |
| WPGraphQL    | —      | GraphQL API dla WordPress                   |

### Backend / CMS

| Technologia                 | Zastosowanie              |
| --------------------------- | ------------------------- |
| WordPress                   | CMS, REST API, media      |
| WPGraphQL (wtyczka)         | GraphQL endpoint          |
| WPGraphQL for ACF (wtyczka) | ACF fields w GraphQL      |
| ACF Pro / Free              | Custom fields dla eventów |

### Python Pipeline

| Biblioteka    | Zastosowanie                |
| ------------- | --------------------------- |
| openai        | OpenAI API (gpt-4o-mini)    |
| requests      | WordPress REST API          |
| python-dotenv | Zmienne środowiskowe        |
| tenacity      | Retry z exponential backoff |
| logging       | Logi do pliku i konsoli     |
| apscheduler   | Harmonogram zadań           |

---

## Struktura projektu

```
WP-Publisher-frontend/                     # Next.js frontend
├── app/
│   ├── admin/
│   │   ├── actions.ts            # Server Actions: zatwierdź/odrzuć
│   │   └── page.tsx              # Panel admina z listą draftów
│   ├── api/
│   │   └── revalidate/
│   │       └── route.ts          # On-demand revalidation endpoint
│   ├── blog/
│   │   ├── [slug]/
│   │   │   └── page.tsx          # Pojedynczy post
│   │   ├── category/
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Posty w kategorii
│   │   ├── loading.tsx           # Skeleton loading
│   │   └── page.tsx              # Lista postów
│   ├── events/
│   │   ├── [slug]/
│   │   │   └── page.tsx          # Pojedynczy event
│   │   ├── error.tsx             # Error boundary
│   │   ├── loading.tsx           # Skeleton loading
│   │   └── page.tsx              # Lista eventów
│   ├── globals.css
│   └── layout.tsx
├── lib/
│   ├── graphql.ts                # Klient GraphQL z cache
│   ├── queries.ts                # Zapytania GraphQL
│   └── types.ts                  # TypeScript interfaces
├── middleware.ts                 # Ochrona /admin (Basic Auth)
├── next.config.ts
├── .env.example
└── README.md

ai-wp-publisher/                  # Python pipeline
├── prompts/
│   ├── event_v1.txt              # Bazowy prompt
│   └── event_v2.txt              # Chain-of-Thought + few-shot
├── ai_client.py                  # Klient OpenAI API
├── wp_client.py                  # Klient WordPress REST API
├── graphql_client.py             # Klient WPGraphQL
├── event_generator.py            # Generator treści eventów
├── event_publisher.py            # Publikacja pojedynczego eventu
├── batch_publisher.py            # Publikacja wsadowa z CSV
├── post_generator.py             # Generator postów blogowych
├── prompt_loader.py              # Wersjonowanie promptów
├── title_generator.py            # Generator tytułów
├── events_batch.csv              # Przykładowe dane wejściowe
├── .env.example
└── README.md
```

---

## Wymagania wstępne

Przed rozpoczęciem upewnij się że masz:

- **Node.js** 18+ — [nodejs.org](https://nodejs.org)
- **Python** 3.11+ — [python.org](https://python.org)
- **WordPress** zainstalowany lokalnie lub na hostingu
- **Konto OpenAI** z kluczem API — [platform.openai.com](https://platform.openai.com)
- **Konto Vercel** — [vercel.com](https://vercel.com)
- **Git** — [git-scm.com](https://git-scm.com)

---

## Setup krok po kroku

### CZĘŚĆ 1 — WordPress

#### 1.1 Instalacja lokalna (XAMPP)

Pobierz i zainstaluj [XAMPP](https://www.apachefriends.org). Uruchom Apache i MySQL w panelu XAMPP. Pobierz WordPress z [wordpress.org/download](https://wordpress.org/download), wypakuj do `C:\xampp\htdocs\project\`.

Wejdź na `http://localhost/project` i przejdź przez instalator WordPress.

#### 1.2 Konfiguracja wp-config.php

Znajdź plik `C:\xampp\htdocs\project\wp-config.php` i dodaj przed linią `/* That's all, stop editing! */`:

```php
define('WP_ENVIRONMENT_TYPE', 'local');
define('FORCE_SSL_ADMIN', false);
```

Te dwie linie są wymagane żeby Application Passwords działały bez HTTPS na lokalnym środowisku.

#### 1.3 Custom Post Type — event

Jeśli chcesz używać CPT `event` (tak jak w tym projekcie), stwórz plik `wp-content/mu-plugins/custom-post-types.php`:

```php
<?php
register_post_type('event', array(
  'show_in_rest'        => true,
  'show_in_graphql'     => true,
  'graphql_single_name' => 'event',
  'graphql_plural_name' => 'events',
  'supports'            => array('title', 'editor', 'excerpt', 'author', 'thumbnail'),
  'rewrite'             => array('slug' => 'events'),
  'has_archive'         => true,
  'public'              => true,
  'labels'              => array(
    'name'          => 'Events',
    'singular_name' => 'Event',
    'all_items'     => 'All Events',
    'add_new_item'  => 'Add New Event',
    'edit_item'     => 'Edit Event',
  ),
  'menu_icon' => 'dashicons-calendar'
));
```

#### 1.4 Instalacja wtyczek WordPress

W wp-admin → **Wtyczki → Dodaj nową** — zainstaluj i aktywuj:

1. **WPGraphQL** — wyszukaj "WPGraphQL" (autor: WPGraphQL)
2. **WPGraphQL for ACF** — wyszukaj "WPGraphQL for ACF"
3. **Advanced Custom Fields** — jeśli używasz ACF fields (opcjonalne)

#### 1.5 Konfiguracja ACF (jeśli używasz)

Jeśli masz grupy pól ACF — dla każdej grupy:
wp-admin → **ACF → Field Groups** → kliknij grupę → włącz **Show in REST API** → włącz **Show in GraphQL** → Zapisz.

#### 1.6 Application Password

wp-admin → **Użytkownicy → Twój profil** → przewiń do sekcji **Application Passwords** → w polu "New Application Password Name" wpisz `python-api` → kliknij **Add New Application Password** → **skopiuj hasło** (zobaczysz je tylko raz).

> ⚠️ Jeśli sekcja Application Passwords nie jest widoczna — upewnij się że dodałeś `define('WP_ENVIRONMENT_TYPE', 'local')` do `wp-config.php` i odśwież stronę.

---

### CZĘŚĆ 2 — Python Pipeline

#### 2.1 Sklonuj repozytorium

```bash
git clone https://github.com/TWOJ_USERNAME/ai-wp-publisher.git
cd ai-wp-publisher
```

#### 2.2 Stwórz wirtualne środowisko

**Windows (PowerShell):**

```powershell
python -m venv venv
.\venv\Scripts\activate.bat
```

**macOS / Linux:**

```bash
python -m venv venv
source venv/bin/activate
```

Po aktywacji zobaczysz `(venv)` na początku linii terminala.

#### 2.3 Zainstaluj zależności

```bash
pip install openai python-dotenv requests tenacity apscheduler
```

#### 2.4 Zmienne środowiskowe

Skopiuj plik przykładowy:

```bash
cp .env.example .env
```

Otwórz `.env` i uzupełnij wartości:

```
OPENAI_API_KEY=sk-proj-tutaj-twoj-klucz-api
WP_URL=http://localhost/project
WP_USERNAME=admin
WP_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
```

**Gdzie znaleźć wartości:**

- `OPENAI_API_KEY` — [platform.openai.com](https://platform.openai.com) → API Keys → Create new secret key
- `WP_USERNAME` — login którym logujesz się do wp-admin
- `WP_APP_PASSWORD` — hasło skopiowane w kroku 1.6

> ⚠️ **Ustaw limit wydatków OpenAI przed pierwszym użyciem:** platform.openai.com → Settings → Limits → Monthly budget → $10

#### 2.5 Test połączenia

Sprawdź czy Python widzi WordPress:

```bash
python wp_client.py
```

Powinieneś zobaczyć listę postów i kategorii z Twojego WP.

#### 2.6 Generowanie eventów

**Pojedynczy event (interaktywnie):**

```bash
python event_publisher.py
```

Wpisz nazwę wydarzenia, datę i kontekst. Potwierdź `t` żeby opublikować draft.

**Wsadowe z pliku CSV:**

```bash
# najpierw dry-run — tylko generuje, nie publikuje
python batch_publisher.py --dry-run

# publikuje wszystkie do WP jako drafty
python batch_publisher.py
```

**Format `events_batch.csv`:**

```csv
name,date,context
Spring Career Fair,15 maja 2026,"Targi pracy, 30 firm IT i finansów. Rejestracja wymagana."
Python Workshop,22 maja 2026,"Warsztaty z automatyzacji. Poziom średniozaawansowany. Limit 20 osób."
```

---

### CZĘŚĆ 3 — Next.js Frontend

#### 3.1 Sklonuj repozytorium

```bash
git clone https://github.com/TWOJ_USERNAME/WP-Publisher-frontend.git
cd WP-Publisher-frontend
```

#### 3.2 Zainstaluj zależności

```bash
npm install
```

#### 3.3 Zmienne środowiskowe

Skopiuj plik przykładowy:

```bash
cp .env.example .env.local
```

Otwórz `.env.local` i uzupełnij:

```
# Publiczny URL WordPressa (dostępny z przeglądarki)
NEXT_PUBLIC_WP_URL=http://localhost/project

# GraphQL endpoint (tylko serwer)
WORDPRESS_GRAPHQL_URL=http://localhost/project/graphql

# Dane do WordPress REST API (tylko serwer — nie dodawaj NEXT_PUBLIC_)
WP_USERNAME=admin
WP_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx

# Sekret do revalidation endpoint (wygeneruj losowy string 32+ znaków)
REVALIDATE_SECRET=wygeneruj-losowy-sekret-minimum-32-znaki

# Hasło do panelu /admin
ADMIN_PASSWORD=twoje-haslo-do-panelu
```

> ⚠️ Nigdy nie dodawaj `NEXT_PUBLIC_` do haseł i kluczy API — wartości z tym prefixem trafiają do bundle JavaScript widocznego w przeglądarce.

#### 3.4 Uruchom dev server

```bash
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000).

#### 3.5 Sprawdź strony

| URL                            | Co powinieneś zobaczyć                       |
| ------------------------------ | -------------------------------------------- |
| `/blog`                        | Lista postów z WordPress + sidebar kategorii |
| `/blog/hello-world`            | Pojedynczy post z formatowaniem              |
| `/blog/category/uncategorized` | Posty w kategorii                            |
| `/events`                      | Lista eventów z datami i obrazkami           |
| `/events/winter-study-night`   | Pojedynczy event z treścią ACF               |
| `/admin`                       | Okno logowania → panel z draftami            |

---

### CZĘŚĆ 4 — Deploy na Vercel

#### 4.1 Przygotuj repozytorium

```bash
cd WP-Publisher-frontend
git init
git add .
git commit -m "feat: initial commit"
```

Utwórz nowe repo na [github.com](https://github.com) i wypchnij kod:

```bash
git remote add origin https://github.com/TWOJ_USERNAME/WP-Publisher-frontend.git
git branch -M main
git push -u origin main
```

#### 4.2 WordPress dostępny publicznie

Vercel jest w internecie — nie może połączyć się z `localhost`. Masz dwie opcje:

**Opcja A — ngrok (development, tymczasowe):**

Pobierz i zainstaluj [ngrok](https://ngrok.com). Zarejestruj się → skopiuj authtoken.

```bash
ngrok config add-authtoken TWOJ_TOKEN
ngrok http 80
```

Skopiuj `https://` URL (np. `https://abc123.ngrok-free.app`).

> ⚠️ Nie zmieniaj adresu WP w ustawieniach WordPress — zostaw `http://localhost/project`. Ngrok tylko tuneluje ruch, WP nie musi o tym wiedzieć.

**Opcja B — hosting (produkcja, zalecane):**

Przenieś WordPress na hosting (Siteground, Hetzner, etc.). Zaktualizuj URL w zmiennych środowiskowych Vercel.

#### 4.3 Import projektu w Vercel

Wejdź na [vercel.com](https://vercel.com) → **Add New Project** → **Import** repo `WP-Publisher-frontend` z GitHub.

Przed kliknięciem Deploy — kliknij **Environment Variables** i dodaj:

```
NEXT_PUBLIC_WP_URL        = https://abc123.ngrok-free.app/project
WORDPRESS_GRAPHQL_URL     = https://abc123.ngrok-free.app/project/graphql
WP_USERNAME               = admin
WP_APP_PASSWORD           = xxxx xxxx xxxx xxxx xxxx xxxx
REVALIDATE_SECRET         = twoj-sekret
ADMIN_PASSWORD            = twoje-haslo
```

Kliknij **Deploy**. Po ~2 minutach dostaniesz publiczny URL.

#### 4.4 Każdy push = automatyczny deploy

Po pierwszym deployu — każdy `git push` do `main` automatycznie wyzwala nowy deploy na Vercel.

```bash
git add .
git commit -m "feat: nowa funkcja"
git push
# Vercel automatycznie deployuje
```

---

## Użycie panelu /admin

1. Wejdź na `https://twoj-projekt.vercel.app/admin`
2. Wpisz login (dowolny) i hasło z `ADMIN_PASSWORD`
3. Zobaczysz listę draftów wygenerowanych przez Python pipeline
4. **✓ Zatwierdź** — publikuje event, pojawia się na `/events`
5. **✕ Odrzuć** — usuwa draft z WP

> Panel odświeża się automatycznie po każdej akcji dzięki `revalidatePath`.

---

## Znane problemy i decyzje techniczne

### Obrazy z lokalnego WP

`next/image` nie działa z lokalnym XAMPP — Next.js image optimizer nie może pobrać obrazów z `localhost:80` będąc sam na `localhost:3000`. Używamy zwykłego `<img>` z `eslint-disable` comment. Na produkcji z WP na prawdziwej domenie: zamień na `<Image />` z `next/image` i zaktualizuj `remotePatterns` w `next.config.ts`.

### force-dynamic zamiast generateStaticParams

Strony `/blog/[slug]`, `/events/[slug]`, `/blog/category/[slug]` używają `export const dynamic = "force-dynamic"`. Powód: brak dostępu do WP podczas buildu na Vercel przy lokalnym setupie. Na produkcji z WP na hostingu: przywróć `generateStaticParams` dla lepszej wydajności (SSG zamiast SSR).

### Application Passwords wymaga HTTPS

WordPress domyślnie blokuje Application Passwords bez HTTPS. Fix dla lokalnego środowiska: dodaj `define('WP_ENVIRONMENT_TYPE', 'local')` do `wp-config.php`.

### URL replacement w fetchGraphQL

`lib/graphql.ts` automatycznie zastępuje `http://localhost/project` na publiczny URL WP w odpowiedziach GraphQL. Dzięki temu obrazki działają na Vercel mimo że WP jest lokalnie.

---

## Koszt AI

Szacunkowy koszt przy modelu `gpt-4o-mini` (maj 2026):

| Skala        | Koszt    |
| ------------ | -------- |
| 1 event      | ~$0.0003 |
| 10 eventów   | ~$0.003  |
| 100 eventów  | ~$0.03   |
| 1000 eventów | ~$0.30   |

> Ustaw miesięczny limit w panelu OpenAI przed skalowaniem.
