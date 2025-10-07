# ConvoMap: Convertitore di Chat in Mappe Mentali

Questo progetto fornisce una catena di strumenti (toolchain) per convertire i log delle conversazioni, esportati in formato Markdown, in mappe mentali interattive in HTML. È stato progettato per estrarre informazioni strutturate da dati conversazionali, ripulirle e visualizzarle in modo gerarchico utilizzando [Markmap](https://markmap.js.org/).

## Obiettivo del Progetto

L'obiettivo principale è trasformare lunghe e spesso complesse cronologie di chat in mappe mentali chiare e navigabili. Questo approccio facilita l'analisi, la documentazione e la revisione dei punti chiave, delle decisioni prese e degli snippet di codice discussi durante una conversazione, specialmente quelle avute con assistenti AI.

## Come Funziona

Il processo è automatizzato tramite script e si articola in due fasi principali, orchestrate dal comando `npm run build`:

1.  **Preprocessing Avanzato (`preprocess.mjs`):**
    *   Lettura dei file Markdown "grezzi" dalla directory `data/`.
    *   Pulizia intelligente per rimuovere il "rumore" conversazionale.
    *   Correzione strutturale per garantire la compatibilità con Markmap.
    *   Salvataggio dei file puliti nella directory `processed_data/`.

2.  **Build delle Mappe (`build.mjs`):**
    *   Esecuzione del preprocessing.
    *   Conversione di ogni file Markdown pulito in una mappa mentale HTML.
    *   Salvataggio dei file HTML nella directory `public/`.
    *   Creazione di un file `index.html` per la navigazione.

## Istruzioni per l'Ambiente IDX

Questo progetto è pre-configurato per l'ambiente di sviluppo IDX. Il file `.idx/dev.nix` installa automaticamente Node.js e Caddy per l'anteprima locale.

### Guida Rapida (IDX)

1.  **Installazione Dipendenze:** `npm install`
2.  **Avvio Build:** `npm run build`
3.  **Visualizzazione:** Apri l'anteprima di IDX per vedere il sito servito da Caddy.

## Pubblicazione con GitHub Pages

Questo repository include un workflow di **GitHub Actions** che automatizza completamente la pubblicazione del sito su GitHub Pages.

### Come Funziona l'Automazione

1.  Ogni volta che effettui un `push` sul branch `main`, l'azione si attiva automaticamente.
2.  Esegue il build del progetto (`npm run build`) su un server virtuale.
3.  Prende il contenuto della cartella `public/` e lo pubblica su un branch dedicato chiamato `gh-pages`.

### Istruzioni per la Configurazione

La prima volta, devi dire a GitHub di usare il risultato di questa automazione per il tuo sito. È un'operazione da fare una sola volta:

1.  Vai sul tuo repository GitHub: `https://github.com/aliennatione/ConvoMap`.
2.  Clicca su **Settings** (Impostazioni).
3.  Nel menu a sinistra, clicca su **Pages**.
4.  Sotto **Build and deployment**, alla voce **Source**, seleziona **GitHub Actions**.

### Accesso al Sito

Dopo il primo push, attendi un paio di minuti che l'azione completi il suo primo ciclo. Il tuo sito sarà quindi visibile all'indirizzo:

**https://aliennatione.github.io/ConvoMap/**

Ad ogni push successivo sul branch `main`, il sito si aggiornerà automaticamente.

## Personalizzazione

Per utilizzare questo strumento con le tue conversazioni:

1.  **Aggiungi i File:** Inserisci i tuoi file `.md` nella directory `data/`.
2.  **Esegui il Commit e il Push:** Salva le modifiche e inviale a GitHub.
    ```bash
    git add data/tuo-nuovo-file.md
    git commit -m "Aggiunto nuovo file di conversazione"
    git push origin main
    ```
3.  **Attendi e Visualizza:** Dopo qualche minuto, l'azione si completerà e la nuova mappa mentale apparirà sul tuo sito GitHub Pages.
