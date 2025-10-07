# ConvoMap: Convertitore di Chat in Mappe Mentali

Questo progetto fornisce una catena di strumenti (toolchain) per convertire i log delle conversazioni, esportati in formato Markdown, in mappe mentali interattive in HTML. È stato progettato per estrarre informazioni strutturate da dati conversazionali, ripulirle e visualizzarle in modo gerarchico utilizzando [Markmap](https://markmap.js.org/).

## Obiettivo del Progetto

L'obiettivo principale è trasformare lunghe e spesso complesse cronologie di chat in mappe mentali chiare e navigabili. Questo approccio facilita l'analisi, la documentazione e la revisione dei punti chiave, delle decisioni prese e degli snippet di codice discussi durante una conversazione, specialmente quelle avute con assistenti AI.

**Casi d'uso:**
*   **Revisione Tecnica:** Analizzare rapidamente le soluzioni tecniche e le alternative discusse.
*   **Documentazione Automatica:** Creare una documentazione visuale da una sessione di brainstorming o di sviluppo.
*   **Apprendimento:** Estrarre e organizzare i concetti chiave da una conversazione didattica.

## Come Funziona

Il processo è automatizzato tramite script e si articola in due fasi principali, orchestrate dal comando `npm run build`:

1.  **Preprocessing Avanzato (`preprocess.mjs`):**
    *   **Lettura:** Legge i file Markdown "grezzi" presenti nella directory `data/`.
    *   **Pulizia Intelligente:** Rimuove il "rumore" conversazionale. Utilizza una serie di espressioni regolari per eliminare saluti, convenevoli, istruzioni rivolte all'AI e altre frasi che non appartengono al contenuto principale.
    *   **Correzione Strutturale:** Applica correzioni specifiche per rendere il contenuto compatibile con Markmap. Ad esempio, nel file `scc.md`, sostituisce i caratteri speciali usati per disegnare alberi di testo (`├`, `─`, `│`) con una sintassi a lista Markdown standard.
    *   **Salvataggio Intermedio:** Salva i file Markdown ripuliti e ristrutturati nella directory `processed_data/`, pronti per la fase successiva.

2.  **Build delle Mappe (`build.mjs`):**
    *   **Esecuzione Preprocessing:** Come prima cosa, avvia lo script `preprocess.mjs` per assicurarsi che i dati siano pronti.
    *   **Conversione:** Utilizza la libreria `markmap-cli` per convertire ogni file Markdown pulito (da `processed_data/`) in una mappa mentale HTML autonoma e interattiva.
    *   **Finalizzazione:** Salva i file HTML finali nella directory `public/`.
    *   **Creazione Indice:** Genera un file `index.html` principale che funge da portale, con un elenco di link a tutte le mappe mentali generate, facilitando la navigazione.

## Struttura del Progetto

```
.
├── .idx/
│   └── dev.nix        # File di configurazione dell'ambiente per IDX.
│                      # Definisce i pacchetti (Node.js, Caddy) e le impostazioni.
├── data/              # INPUT: Directory dove inserire i file Markdown grezzi.
├── processed_data/    # INTERMEDIO: Contiene i file Markdown dopo la pulizia. (Gitignored)
├── public/            # OUTPUT: Contiene le mappe mentali HTML finali e l'indice.
├── node_modules/      # Dipendenze del progetto. (Gitignored)
├── build.mjs          # Script principale che orchestra il processo di build.
├── preprocess.mjs     # Script per la pulizia e la strutturazione dei dati.
├── package.json       # Definisce gli script (npm run build) e le dipendenze.
└── README.md          # Questa documentazione.
```

## Istruzioni per l'Ambiente IDX

### Configurazione dell'Ambiente

Questo progetto è pre-configurato per funzionare al meglio all'interno dell'ambiente di sviluppo IDX di Google. Il file `.idx/dev.nix` si occupa di configurare automaticamente tutto il necessario:

*   **`pkgs.nodejs_20`**: Installa l'ambiente di runtime JavaScript (Node.js) necessario per eseguire gli script.
*   **`pkgs.caddy`**: Installa Caddy, un web server moderno e leggero, utilizzato per servire i file HTML generati e fornire un'anteprima live.
*   **`idx.previews`**: Configura l'anteprima web nell'editor di IDX, avviando automaticamente il server Caddy e puntandolo alla directory `public/`.

### Guida Rapida

1.  **Installazione delle Dipendenze:**
    Questo comando legge il file `package.json` e scarica le librerie necessarie, come `markmap-cli`.
    ```bash
    npm install
    ```

2.  **Avvio del Processo di Build:**
    Questo è il comando principale. Esegue l'intera pipeline: preprocessing e successiva generazione delle mappe.
    ```bash
    npm run build
    ```

3.  **Visualizzazione delle Mappe Mentali:**
    *   Una volta terminato il build, il pannello di anteprima (Preview) di IDX si aggiornerà.
    *   Il server Caddy mostrerà il contenuto della directory `public/`.
    *   Puoi aprire il file `index.html` per visualizzare l'elenco di tutte le mappe generate e cliccare sui link per esplorarle.

## Personalizzazione

Per utilizzare questo strumento con le tue conversazioni:

1.  **Esporta la Chat:** Salva la cronologia della tua chat in un file con estensione `.md`.
2.  **Aggiungi il File:** Inserisci il file appena creato nella directory `data/`.
3.  **Esegui il Build:** Lancia il comando `npm run build` dal terminale.
4.  **Visualizza:** La tua nuova mappa mentale sarà disponibile nel pannello di anteprima e nella directory `public/`.

**Suggerimento:** Se le tue chat contengono pattern conversazionali diversi da quelli gestiti, puoi personalizzare lo script `preprocess.mjs` aggiungendo nuove regole di filtraggio all'array `conversationalPatterns`.
