## Znane problemy i decyzje

### Obrazy z WordPress (lokalny XAMPP)

`next/image` z `fill` nie działa z lokalnym XAMPP bo Next.js image optimizer
nie może pobrać obrazów z localhost:80 będąc sam na localhost:3000.

Rozwiązanie tymczasowe: zwykły `<img>` z `eslint-disable` comment.
Na produkcji: zamienić na `<Image />` z `next/image` — zadziała gdy WP
będzie na prawdziwej domenie z HTTPS.

`next.config.ts` już ma skonfigurowane `remotePatterns` — wystarczy
zmienić `hostname` na domenę produkcyjną.
