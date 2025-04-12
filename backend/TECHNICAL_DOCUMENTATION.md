# Documentazione Tecnica Backend Audiobook

## Panoramica del Progetto
**Scopo principale**: Piattaforma per la gestione e streaming di audiolibri con funzionalità di bookmarking per utenti.

**Funzionalità core**:
- Upload e gestione audiolibri (con metadati audio)
- Streaming audio con supporto range requests
- Bookmarking per utenti
- Gestione copertine libri
- Paginazione e filtraggio libri

**Diagramma architetturale**:
```
Client → API Gateway (NestJS) → Servizi → Database/Storage
       ↑                     ↓
       ← Autenticazione/JWT ←
```
- Architettura a microservizi monolitica
- Separazione chiara tra controller e servizi
- Integrazione con AWS S3 per storage file

## Tech Stack Dettagliato

**Linguaggi/Framework**:
- Node.js (v16+)
- NestJS (v11.0.12)
- TypeORM (v0.3.21)
- TypeScript (v5.8.2)

**Librerie principali**:
- `@nestjs/swagger` - Documentazione API
- `nestjs-paginate` - Paginazione
- `music-metadata` - Estrazione metadati audio
- `aws-sdk` - Integrazione S3
- `@nestjs/bull`, `bull` - Gestione code di background (per capitoli)
- `class-validator` - Validazione DTO

**Database**:
- PostgreSQL (configurabile via env)
- Redis (per code Bull e caching)
- Schema principale (PostgreSQL):
```mermaid
erDiagram
    Book ||--o{ Chapter : contains
    Book ||--o{ Bookmark : has
    Book ||--|| Audio : has

    Book {
        string id PK
        string title
        string author
        string description nullable
        string cover nullable
        string audioId FK nullable
        datetime createdAt
        datetime updatedAt
    }

    Audio {
        string id PK
        string s3Key
        string format
        int duration
        int bitrate
        int channels
        int size
        int frequency
    }

    Bookmark {
        int id PK
        string userId
        string bookId FK
        datetime createdAt
    }

    Chapter {
        int id PK
        int chapterNumber
        string description
        int startTime
        int endTime
        string bookId FK
    }
```

**API/Interfacce**:
- REST API documentata con Swagger
- Endpoint versionati (v1)
- Autenticazione JWT

**DevOps**:
- Docker (docker-compose.yaml)
- CI/CD (script in package.json)
- Variabili d'ambiente gestite via @nestjs/config

## Moduli Principali

### Modulo Books
**Scopo**: Gestione audiolibri e streaming

**Dipendenzze**:
- TypeORM (entità Book, Audio, Bookmark)
- S3Module (upload/download file)
- ConfigModule (configurazioni)

**File chiave**:
- `books.controller.ts` - Endpoint API
- `books.service.ts` - Business logic (incluso dispatch job capitoli)
- `entities/` - Definizioni database (Book, Audio, Bookmark, Chapter)

**Flusso dati**:
1. Upload → Estrai metadati → Salva su S3 → Crea record DB
2. Stream → Recupera da S3 → Stream response

### Modulo Auth
**Scopo**: Autenticazione e autorizzazione

**Dipendenzze**:
- Passport/JWT
- Redis (sessioni)
- Google/Facebook auth

### Modulo Users
**Scopo**: Gestione utenti

### Modulo Progress
**Scopo**: Tracciamento del progresso di ascolto degli utenti per ogni audiolibro, ottimizzato per aggiornamenti frequenti tramite caching Redis e persistenza asincrona su DB.

**Dipendenze**:
- TypeORM (entità `AudiobookProgress`)
- UsersModule (associazione utente)
- BooksModule (associazione libro)
- RedisModule (caching progressi)
- ScheduleModule (per Cron Job di sincronizzazione)
- `@nestjs/websockets`, `socket.io` (per il Gateway WebSocket)
- `class-validator` (per validazione DTO WebSocket)

**File chiave**:
- `progress.controller.ts` - Endpoint API **solo** per **recuperare** il progresso (`GET /progress/:userId/:bookId`).
- `progress.service.ts` - Contiene la logica di recupero e sincronizzazione DB:
    - `findOne()`: Recupera il progresso (prima da Redis, poi da DB).
    - `handleCronSync()`: Cron job per sincronizzare Redis con il DB.
- `progress.gateway.ts` - Gestisce la ricezione degli aggiornamenti di progresso via **WebSocket**.
- `dto/update-progress.dto.ts` - Definisce la struttura dati per gli aggiornamenti via WebSocket.
- `entities/audiobook-progress.entity.ts` - Definizione dell'entità TypeORM per la tabella `audiobook_progress`.

**Funzionalità e Flusso Dati Dettagliato**:

1.  **Salvataggio Progresso (via WebSocket e Redis)**:
    *   Il client invia aggiornamenti di progresso tramite una connessione **WebSocket** al `ProgressGateway`.
    *   **Messaggi WebSocket**:
        *   `updateProgress`: Utilizzato per aggiornamenti frequenti durante la riproduzione.
        *   `saveFinalProgress`: Inteso per l'ultimo aggiornamento (es. chiusura player), attualmente esegue la stessa logica di `updateProgress` ma potrebbe essere esteso per forzare un salvataggio DB immediato in futuro.
    *   **Payload Messaggio (per entrambi i messaggi)**: Il client deve inviare un oggetto JSON che corrisponde a `UpdateProgressDto`:
        ```typescript
        interface UpdateProgressPayload {
          userId: string; // UUID dell'utente
          bookId: string; // UUID del libro
          time: number;   // Progresso attuale in secondi (intero >= 0)
        }
        ```
        *Esempio*: `{ "userId": "...", "bookId": "...", "time": 185 }`
    *   **Gestione nel Gateway (`handleUpdateProgress`, `handleSaveFinalProgress`)**:
        1.  Il gateway riceve il messaggio e valida il payload usando `UpdateProgressDto` e `ValidationPipe`.
        2.  Costruisce la chiave Redis (`progress:<userId>`) e il valore JSON (`{"time": <seconds>, "updatedAt": <timestamp_ms>}`).
        3.  Scrive/Aggiorna il campo `<bookId>` nell'hash Redis `progress:<userId>` con il nuovo valore JSON usando `HSET`.
        4.  Logga l'operazione. Non invia acknowledgement di default, ma potrebbe essere aggiunto.
    *   **Performance**: Questo approccio permette di gestire un alto volume di aggiornamenti scrivendo solo su Redis, che è molto più veloce del DB.

2.  **Recupero Progresso (`GET /progress/:userId/:bookId`)**:
    *   Il client richiede il progresso tramite l'endpoint REST fornito da `ProgressController`.
    *   `ProgressService.findOne()` viene invocato.
    *   **Step 1: Controllo Cache Redis**: Il servizio tenta di leggere il campo `<bookId>` dalla chiave hash `progress:<userId>` in Redis.
    *   **Step 2: Parsing e Restituzione (se trovato in Redis)**: Se il valore viene trovato e il JSON è valido (contiene `time` numerico), il valore `time` viene restituito immediatamente al client.
    *   **Step 3: Controllo Database (se non in Redis o Redis fallisce)**: Se la chiave/campo non esiste in Redis o il parsing del JSON fallisce, il servizio interroga la tabella `audiobook_progress` nel database PostgreSQL cercando un record con `userId` e `bookId` corrispondenti.
    *   **Step 4: Restituzione (se trovato in DB)**: Se un record viene trovato nel DB, il suo valore `time` viene restituito.
    *   **Step 5: Default (se non trovato)**: Se il progresso non viene trovato né in Redis né nel DB, viene restituito `0`.

3.  **Sincronizzazione Asincrona Redis -> Database (Cron Job)**:
    *   Il metodo `ProgressService.handleCronSync()` è decorato con `@Cron(CronExpression.EVERY_10_MINUTES)` e viene eseguito automaticamente ogni 10 minuti.
    *   **Obiettivo**: Persistere nel database PostgreSQL gli aggiornamenti di progresso recenti memorizzati temporaneamente in Redis.
    *   **Flusso**:
        1.  Il job si avvia (utilizza un flag `isSyncing` per prevenire esecuzioni sovrapposte).
        2.  Utilizza il comando `SCAN` di Redis per iterare su tutte le chiavi che corrispondono al pattern `progress:*` (per evitare di bloccare Redis con `KEYS *`).
        3.  Per ogni chiave utente (`progress:<userId>`), recupera tutti i campi (bookId) e valori (JSON progresso) con `HGETALL`.
        4.  Per ogni progresso di libro, controlla il timestamp `updatedAt` nel JSON.
        5.  **Filtro**: Se `updatedAt` è negli ultimi 30 minuti, l'aggiornamento è considerato "recente" e viene preparato per il salvataggio nel DB.
        6.  **Salvataggio DB**: Tutti gli aggiornamenti recenti raccolti vengono salvati nella tabella `audiobook_progress` utilizzando `progressRepository.save()` (che gestisce l'inserimento o l'aggiornamento - upsert - basato sulla chiave primaria composta `userId`/`bookId`). Il salvataggio avviene in batch (`chunk: 100`) per efficienza.
        7.  **Pulizia Redis**: **Solo se il salvataggio nel DB ha successo**, le chiavi Redis (`progress:<userId>`) che contenevano almeno un aggiornamento sincronizzato vengono eliminate da Redis usando `DEL`. Questo previene la risincronizzazione degli stessi dati e mantiene la cache relativamente pulita. Se il salvataggio DB fallisce, le chiavi Redis **non** vengono eliminate per permettere un nuovo tentativo al ciclo successivo.

**Considerazioni Architetturali**:
*   **Scalabilità**: L'uso di Redis come buffer di scrittura riduce drasticamente il carico sul database principale, migliorando la capacità del sistema di gestire molti utenti che aggiornano il loro progresso frequentemente.
*   **Consistenza Eventuale**: C'è un ritardo (fino a 10-40 minuti, a seconda di quando l'aggiornamento avviene rispetto al cron job e al filtro dei 30 minuti) tra l'aggiornamento del progresso in Redis e la sua persistenza nel DB. Il recupero tramite `findOne` mitiga questo leggendo prima da Redis.
*   **Salvataggio Diretto al DB**: È tecnicamente possibile modificare l'handler `saveFinalProgress` nel gateway per scrivere direttamente nel DB (bypassando o affiancando Redis) per garantire la persistenza immediata dell'ultimo stato. Questo potrebbe essere utile in scenari come la chiusura del browser.
*   **Affidabilità**: Il meccanismo di sincronizzazione include logging e gestione degli errori. Il gateway WebSocket gestisce errori di scrittura Redis ma non implementa meccanismi di retry complessi lato client.

### Modulo Gemini & Background Jobs
**Scopo**: Generazione automatica di capitoli per audiolibri tramite API esterne (Gemini) in background.

**Dipendenze**:
- `@nestjs/bull`, `bull` (per la coda `audio-processing`)
- Redis (broker per Bull)
- ConfigModule (per `GEMINI_API_KEY`)
- BooksModule (per accedere a `BooksService` e `Chapter` repository)

**File chiave**:
- `gemini/gemini.service.ts` - Servizio per interagire con l'API Gemini (attualmente placeholder).
- `gemini/gemini.processor.ts` (`AudioProcessor`) - Consumer della coda `audio-processing`, gestisce i job `generate-chapters`.
- `gemini/gemini.module.ts` - Configura il modulo, registra la coda e il processore, importa `BooksModule`.

**Flusso dati (Generazione Capitoli)**:
1.  `BooksService.create()` salva un libro con audio.
2.  Se il salvataggio ha successo, `BooksService` aggiunge un job `generate-chapters` alla coda Bull `audio-processing` con il `bookId`.
3.  `AudioProcessor` riceve il job dalla coda Redis.
4.  `AudioProcessor` usa `BooksService.findOne()` per recuperare i dettagli del libro e dell'audio (incluso `s3Key`).
5.  `AudioProcessor` chiama `GeminiService.analyzeAudio()` passando `s3Key` (o il path completo/URL se necessario in futuro).
6.  `GeminiService` (placeholder) restituisce dati mock dei capitoli.
7.  `AudioProcessor` logga i capitoli ricevuti (placeholder per il salvataggio nel DB tramite `chaptersRepository`).
8.  In caso di errore durante il processo, l'errore viene loggato e rilanciato per permettere a Bull di gestire tentativi/fallimenti.

## Core Business Logic

### Funzioni critiche (BooksService)

**create()**
- Input: `CreateBookDto` + file audio/cover
- Output: `Book` entity
- Flusso:
  1. Valida input
  2. Upload file su S3
  3. Estrai metadati audio
  4. Crea record DB per `Audio` e `Book`.
  5. **Se l'audio è presente, aggiunge un job `generate-chapters` alla coda `audio-processing`.**
- Eccezioni:
  - `BadRequestException` - File non valido
  - `S3UploadError` - Upload fallito

**streamAudio()**
- Input: bookId, response object
- Output: void (stream diretto)
- Flusso:
  1. Recupera metadati audio
  2. Configura headers response
  3. Stream da S3 a client
- Eccezioni:
  - `NotFoundException` - Audio non trovato

**addBookmark()**
- Input: userId, bookId
- Output: `Bookmark` entity
- Controlli:
  - Esistenza libro
  - Bookmark duplicato

## Utilities & Best Practices

**Configurazione**:
- Configurazioni centralizzate in `src/config/`
- Validazione env variables con class-validator

**Error Handling**:
- Exception filters globali
- Errori specifici per dominio

**Logging**:
- Logger integrato NestJS
- Formattazione strutturata

**Cache**:
- Redis per sessioni
- Cache HTTP (da implementare)

**Security**:
- JWT per autenticazione
- CORS configurato
- Rate limiting (da implementare)

**Convenzioni**:
- DTO separati per input/output
- Decoratori Swagger per documentazione
- Serializzazione con `class-transformer`
- Validazione con `class-validator`

## Environment & Deployment

**Setup**:
```bash
# Variabili d'ambiente (vedi env-example)
cp env-example .env

# Dipendenze
npm install

# Database
docker-compose up -d postgres
npm run migration:run

# Avvio
npm run start:dev

# Variabile aggiuntiva per Gemini
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

**CI/CD**:
- Script predefiniti in package.json
- Docker multi-stage build

**Monitoring**:
- Logging centralizzato
- Health check (da implementare)
- Metrics (da implementare)

## Known Issues & Tech Debt

**Problemi aperti**:
1. [MEDIO] Gestione errori S3 non completa
2. [BASSO] Manca cache per metadati audio
3. [ALTO] Manca sistema di notifiche per upload completato
4. [MEDIO] L'integrazione con Gemini API in `GeminiService` è solo un placeholder.
5. [BASSO] Il salvataggio dei capitoli generati in `AudioProcessor` è un placeholder.

**Aree fragili**:
- Stream audio con grandi file
- Transazioni DB durante upload

## Raccomandazioni Estensioni

**Nuovi moduli**:
1. Sistema di notifiche (WebSocket)
2. Modulo statistiche ascolti
3. Integrazione payment gateway

**Punti estensione**:
- `BooksService` → Aggiungere hook post-upload
- `AuthModule` → Supporto più social provider
