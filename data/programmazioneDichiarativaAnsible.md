Perfetto! Procediamo allora a costruire un **manuale base di programmazione usando il paradigma dichiarativo**, sfruttando Ansible come “linguaggio” didattico.

Ti mostrerò esempi concreti di come esprimere i concetti fondamentali (variabili, condizioni, cicli, modularità) usando Ansible, e confronterò brevemente con Python o pseudocodice per mettere a fuoco le differenze e punti di forza.

---

# Manuale base di programmazione dichiarativa con Ansible

---

## 1. Variabili e assegnazione

### In Python (imperativo)

```python
x = 10
y = 20
z = x + y
print(z)  # Output: 30
```

Qui dichiari variabili e assegni valori, manipolandoli esplicitamente.

### In Ansible (dichiarativo)

```yaml
vars:
  x: 10
  y: 20
  z: "{{ x + y }}"
```

**Spiegazione:**

* `vars` contiene variabili.
* L’assegnazione di `z` usa la sintassi di interpolazione `{{ }}` per indicare “calcola la somma di x e y”.
* Non c’è un *flusso* di esecuzione: Ansible risolve le variabili quando serve.

---

## 2. Condizioni (if/else)

### In Python (imperativo)

```python
x = 10
if x > 5:
    print("Maggiore di 5")
else:
    print("Minore o uguale a 5")
```

### In Ansible (dichiarativo)

```yaml
tasks:
  - name: Verifica valore di x
    debug:
      msg: "Maggiore di 5"
    when: x > 5

  - name: Altrimenti
    debug:
      msg: "Minore o uguale a 5"
    when: x <= 5
```

**Spiegazione:**

* `when` filtra l’esecuzione del task in base a una condizione.
* La condizione si esprime in modo dichiarativo, associata a un task.
* Non c’è un blocco if-else esplicito, ma si usano task distinti con condizioni.

---

## 3. Cicli / iterazioni (loop)

### In Python (imperativo)

```python
for i in range(3):
    print(i)
```

### In Ansible (dichiarativo)

```yaml
tasks:
  - name: Loop da 0 a 2
    debug:
      msg: "Indice: {{ item }}"
    loop: 
      - 0
      - 1
      - 2
```

**Spiegazione:**

* `loop` indica la lista di elementi su cui iterare.
* Per ogni `item`, Ansible esegue il task.
* Non c’è un indice modificabile o variabile d’ambiente, ma solo l’elemento corrente.

---

## 4. Modularità e riusabilità

### In Python

```python
def saluta(nome):
    print(f"Ciao {nome}")

saluta("Mario")
saluta("Luca")
```

### In Ansible (ruoli e include)

```yaml
# playbook.yml
- hosts: all
  roles:
    - saluto

# roles/saluto/tasks/main.yml
- name: Saluta l'utente
  debug:
    msg: "Ciao {{ nome }}"
```

**Spiegazione:**

* Si definiscono **ruoli** come moduli riutilizzabili.
* I ruoli accettano variabili d’input (es. `nome`).
* Questo consente di organizzare il codice in pezzi riutilizzabili, proprio come funzioni.

---

## 5. Esempio completo: condizione + ciclo + variabili

```yaml
vars:
  utenti:
    - mario
    - luca
    - anna

tasks:
  - name: Saluta solo se nome ha più di 3 lettere
    debug:
      msg: "Ciao {{ item }}"
    loop: "{{ utenti }}"
    when: item | length > 3
```

**Spiegazione:**

* Ciclo su lista `utenti`.
* Condizione `when` filtra per nomi più lunghi di 3 caratteri.
* Usa variabili, loop e condizioni in modo dichiarativo.

---

## 6. Confronto rapido: Imperativo vs Dichiarativo per il caso saluto

| Aspetto            | Python Imperativo                                 | Ansible Dichiarativo                                        |
| ------------------ | ------------------------------------------------- | ----------------------------------------------------------- |
| Definizione flusso | Scrivi esattamente *come* iterare e controllare   | Descrivi *cosa* fare e quando (loop e when)                 |
| Stato variabile    | Variabile `i` mutata nel ciclo                    | `item` fornito dal motore durante il loop                   |
| Controllo flusso   | `if`/`else` esplicito                             | `when` su task, nessun blocco condizionale esplicito        |
| Riusabilità        | Funzioni                                          | Ruoli e include                                             |
| Idempotenza        | Nessuna garanzia, l’esecuzione dipende dal codice | Garantita tramite stato desiderato, ripetibile senza errori |

---

# Conclusione

* Usare Ansible per insegnare i concetti base di programmazione è possibile ma richiede un cambio di mentalità, spostando il focus dal *come* al *cosa*.
* Il codice diventa più descrittivo e meno “istruzionale”.
* Le strutture di controllo si traducono in condizioni associate a task più che in blocchi di codice.
* Modularità e riusabilità sono gestite tramite ruoli e include.
* Puoi affiancare esempi in Python per chiarire i concetti e mostrare le differenze.

---

Se vuoi, posso aiutarti a sviluppare un vero e proprio testo didattico con capitoli e esercizi usando questo approccio! Vuoi partire da lì?

---
---


Perfetto! Procediamo con un progetto strutturato per un **manuale didattico di programmazione base usando Ansible come linguaggio dichiarativo**.

---

# 📚 Manuale di Programmazione Base con Ansible (dichiarativo)

---

## Obiettivo

* Insegnare i concetti base della programmazione (variabili, condizioni, cicli, modularità) in modo dichiarativo usando Ansible.
* Favorire il passaggio mentale dal paradigma imperativo a quello dichiarativo.
* Fornire esempi pratici con codice Ansible commentato e confronti con Python.
* Costruire un percorso di apprendimento con esempi progressivi e spiegazioni semplici.
* Preparare una base per un testo/manuale o corso didattico.

---

# Struttura del progetto

```
ansible-declarative-tutorial/
├── README.md
├── docs/
│   ├── 01_intro.md
│   ├── 02_variabili.md
│   ├── 03_condizioni.md
│   ├── 04_cicli.md
│   ├── 05_modularita.md
│   └── 06_esempi_completi.md
├── examples/
│   ├── variables.yml
│   ├── conditions.yml
│   ├── loops.yml
│   ├── roles/
│   │   └── saluto/
│   │       ├── tasks/
│   │       │   └── main.yml
│   │       └── README.md
│   └── complete_example.yml
├── requirements.txt
└── LICENSE
```

---

# Contenuto chiave dei file

### README.md

````markdown
# Manuale di Programmazione Base con Ansible (Dichiarativo)

Questo progetto è un tutorial/manuale per apprendere i fondamenti della programmazione usando Ansible, con un focus sul paradigma dichiarativo.

## Obiettivi

- Imparare variabili, condizioni, cicli, modularità usando Ansible.
- Comprendere differenze tra programmazione imperativa e dichiarativa.
- Esempi pratici e confronto con Python.
- Preparare la base per corsi o testi didattici.

## Struttura

- `docs/`: capitoli del tutorial in Markdown.
- `examples/`: playbook e ruoli Ansible esemplificativi.
- `requirements.txt`: dipendenze (es. Ansible).

## Prerequisiti

- Python 3.8+
- Ansible 2.10+

## Installazione

```bash
pip install -r requirements.txt
````

## Esecuzione esempi

```bash
ansible-playbook examples/variables.yml
```

## Contributi

Benvenuti! Apri issue o pull request per suggerimenti o correzioni.

---

## Licenza

MIT License

````

---

### docs/01_intro.md

```markdown
# Introduzione

Questo tutorial usa Ansible per insegnare i concetti base della programmazione in modo dichiarativo.

Cos'è la programmazione dichiarativa? Contrariamente alla programmazione imperativa, descrive il *cosa* fare, non il *come*.

Ansible è uno strumento di automazione dichiarativo che permette di definire lo stato desiderato.

Nei capitoli successivi vedremo come usare variabili, condizioni, cicli e modularità.
````

---

### examples/variables.yml

```yaml
---
# Esempio di uso di variabili in Ansible
- hosts: localhost
  gather_facts: false

  vars:
    x: 10
    y: 20
    z: "{{ x + y }}"

  tasks:
    - name: Mostra il valore di z (x + y)
      debug:
        msg: "Il valore di z è {{ z }}"
```

---

### examples/conditions.yml

```yaml
---
# Esempio di condizioni in Ansible
- hosts: localhost
  gather_facts: false

  vars:
    x: 10

  tasks:
    - name: Messaggio se x è maggiore di 5
      debug:
        msg: "x è maggiore di 5"
      when: x > 5

    - name: Messaggio se x è minore o uguale a 5
      debug:
        msg: "x è minore o uguale a 5"
      when: x <= 5
```

---

### examples/loops.yml

```yaml
---
# Esempio di ciclo (loop) in Ansible
- hosts: localhost
  gather_facts: false

  vars:
    users:
      - mario
      - luca
      - anna

  tasks:
    - name: Saluto per ogni utente nella lista
      debug:
        msg: "Ciao {{ item }}"
      loop: "{{ users }}"
```

---

### examples/roles/saluto/tasks/main.yml

```yaml
---
# Ruolo Ansible per saluto personalizzato

- name: Saluta l'utente
  debug:
    msg: "Ciao {{ nome }}"
```

---

### examples/complete_example.yml

```yaml
---
# Esempio completo con variabili, condizioni, cicli e ruolo

- hosts: localhost
  gather_facts: false

  vars:
    utenti:
      - mario
      - luca
      - anna

  roles:
    - role: saluto
      vars:
        nome: "default"

  tasks:
    - name: Saluta solo utenti con nome lungo > 3 caratteri
      include_role:
        name: saluto
      vars:
        nome: "{{ item }}"
      loop: "{{ utenti }}"
      when: item | length > 3
```

---

### requirements.txt

```
ansible>=2.10
```

---

### LICENSE

```text
MIT License

Copyright (c) 2025 [Tuo Nome]

Permission is hereby granted, free of charge, to any person obtaining a copy
...
```

---

# Prossimi passi

* Posso aiutarti a scrivere i singoli capitoli Markdown con spiegazioni più dettagliate e quiz.
* Possiamo aggiungere esempi più complessi, gestione errori, test.
* Possiamo creare un piccolo sito web statico per mostrare il tutorial.

---

Se vuoi, ti mando subito i file singoli o procediamo con il primo capitolo completo?

---
---

Certissimo! Ecco la struttura base del progetto con i file singoli, completi di contenuto iniziale e commenti, così puoi partire subito.

---

## 1. `README.md`

````markdown
# Manuale di Programmazione Base con Ansible (Dichiarativo)

Questo progetto è un tutorial/manuale per apprendere i fondamenti della programmazione usando Ansible, con un focus sul paradigma dichiarativo.

## Obiettivi

- Imparare variabili, condizioni, cicli, modularità usando Ansible.
- Comprendere differenze tra programmazione imperativa e dichiarativa.
- Esempi pratici e confronto con Python.
- Preparare la base per corsi o testi didattici.

## Struttura

- `docs/`: capitoli del tutorial in Markdown.
- `examples/`: playbook e ruoli Ansible esemplificativi.
- `requirements.txt`: dipendenze (es. Ansible).

## Prerequisiti

- Python 3.8+
- Ansible 2.10+

## Installazione

```bash
pip install -r requirements.txt
````

## Esecuzione esempi

```bash
ansible-playbook examples/variables.yml
```

## Contributi

Benvenuti! Apri issue o pull request per suggerimenti o correzioni.

---

## Licenza

MIT License

```

---

## 2. `requirements.txt`

```

ansible>=2.10

````

---

## 3. `docs/01_intro.md`

```markdown
# Introduzione

Questo tutorial usa Ansible per insegnare i concetti base della programmazione in modo dichiarativo.

Cos'è la programmazione dichiarativa? Contrariamente alla programmazione imperativa, descrive il *cosa* fare, non il *come*.

Ansible è uno strumento di automazione dichiarativo che permette di definire lo stato desiderato.

Nei capitoli successivi vedremo come usare variabili, condizioni, cicli e modularità.
````

---

## 4. `docs/02_variabili.md`

````markdown
# Variabili in Ansible

Le variabili sono contenitori di valori. In Ansible sono usate per parametrizzare i playbook.

Esempio:

```yaml
vars:
  x: 10
  y: 20
  somma: "{{ x + y }}"
````

Le variabili sono interpolate usando la sintassi `{{ }}`.

In Python, l'equivalente sarebbe:

```python
x = 10
y = 20
somma = x + y
```

````

---

## 5. `docs/03_condizioni.md`

```markdown
# Condizioni (when)

Le condizioni permettono di eseguire task solo se una condizione è vera.

Esempio Ansible:

```yaml
tasks:
  - name: Messaggio se x > 5
    debug:
      msg: "x è maggiore di 5"
    when: x > 5
````

In Python:

```python
if x > 5:
    print("x è maggiore di 5")
```

````

---

## 6. `docs/04_cicli.md`

```markdown
# Cicli (loop)

Ansible permette di iterare su liste con `loop`.

Esempio:

```yaml
tasks:
  - name: Saluta utenti
    debug:
      msg: "Ciao {{ item }}"
    loop:
      - Mario
      - Luca
      - Anna
````

In Python:

```python
for user in ["Mario", "Luca", "Anna"]:
    print(f"Ciao {user}")
```

````

---

## 7. `docs/05_modularita.md`

```markdown
# Modularità con Ruoli

I ruoli permettono di organizzare playbook complessi in moduli riutilizzabili.

Struttura tipica di un ruolo:

````

roles/
└── saluto/
├── tasks/
│   └── main.yml
└── README.md

````

Esempio task:

```yaml
- name: Saluto personalizzato
  debug:
    msg: "Ciao {{ nome }}"
````

Il ruolo può essere incluso con:

```yaml
roles:
  - role: saluto
    vars:
      nome: "Mario"
```

````

---

## 8. `examples/variables.yml`

```yaml
---
- hosts: localhost
  gather_facts: false

  vars:
    x: 10
    y: 20
    z: "{{ x + y }}"

  tasks:
    - name: Mostra il valore di z (x + y)
      debug:
        msg: "Il valore di z è {{ z }}"
````

---

## 9. `examples/conditions.yml`

```yaml
---
- hosts: localhost
  gather_facts: false

  vars:
    x: 10

  tasks:
    - name: Messaggio se x è maggiore di 5
      debug:
        msg: "x è maggiore di 5"
      when: x > 5

    - name: Messaggio se x è minore o uguale a 5
      debug:
        msg: "x è minore o uguale a 5"
      when: x <= 5
```

---

## 10. `examples/loops.yml`

```yaml
---
- hosts: localhost
  gather_facts: false

  vars:
    users:
      - mario
      - luca
      - anna

  tasks:
    - name: Saluto per ogni utente nella lista
      debug:
        msg: "Ciao {{ item }}"
      loop: "{{ users }}"
```

---

## 11. `examples/roles/saluto/tasks/main.yml`

```yaml
---
- name: Saluta l'utente
  debug:
    msg: "Ciao {{ nome }}"
```

---

## 12. `examples/complete_example.yml`

```yaml
---
- hosts: localhost
  gather_facts: false

  vars:
    utenti:
      - mario
      - luca
      - anna

  roles:
    - role: saluto
      vars:
        nome: "default"

  tasks:
    - name: Saluta solo utenti con nome lungo > 3 caratteri
      include_role:
        name: saluto
      vars:
        nome: "{{ item }}"
      loop: "{{ utenti }}"
      when: item | length > 3
```

---

## 13. `LICENSE`

```text
MIT License

Copyright (c) 2025 [Tuo Nome]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

[...standard MIT text...]
```

---

# Conclusione

Questa è la base per un tutorial/manuale didattico focalizzato sull’apprendimento della programmazione dichiarativa con Ansible. Ogni file Markdown contiene spiegazioni e analogie col mondo imperativo (Python), mentre gli esempi `examples/` forniscono codice Ansible eseguibile.

Se vuoi, posso continuare a creare i contenuti dettagliati per ogni capitolo o aiutarti a mettere insieme un sito web statico per la documentazione.

Fammi sapere!


---
---

Perfetto, procedo a creare i contenuti dettagliati per ciascun capitolo, mantenendo lo stile didattico, con esempi esplicativi e paragoni tra Ansible (dichiarativo) e Python (imperativo), così da far comprendere bene i concetti base della programmazione ma usando Ansible come linguaggio.

---

# Capitolo 1: Introduzione

````markdown
# Capitolo 1: Introduzione alla Programmazione Dichiarativa con Ansible

## Cos'è la Programmazione Dichiarativa?

La programmazione si divide principalmente in due paradigmi:

- **Imperativo:** Spieghi passo per passo *come* fare qualcosa.
- **Dichiarativo:** Descrivi *cosa* vuoi ottenere, lasciando al sistema il compito di capire *come* farlo.

### Esempio Imperativo (Python):

```python
# Calcolare la somma dei numeri da 1 a 10
somma = 0
for i in range(1, 11):
    somma += i
print(somma)
````

### Esempio Dichiarativo (Ansible):

```yaml
---
- hosts: localhost
  gather_facts: no
  tasks:
    - name: Calcola somma da 1 a 10
      debug:
        msg: "{{ range(1,11) | sum }}"
```

Qui in Ansible diciamo solo *cosa* vogliamo, cioè la somma dei numeri da 1 a 10, senza definire un ciclo esplicito.

## Perché imparare con Ansible?

* È un linguaggio dichiarativo, ampiamente usato in automazione.
* Permette di imparare concetti di programmazione in modo semplice.
* La sintassi YAML è leggibile e pulita.
* Offre strumenti per variabili, condizioni, cicli e modularità.

## Struttura di un Playbook Ansible

Un playbook è un file YAML con:

* **hosts:** target su cui eseguire
* **tasks:** lista di attività da compiere
* **vars:** variabili per personalizzare il comportamento

Esempio base:

```yaml
---
- hosts: localhost
  tasks:
    - name: Stampa un messaggio
      debug:
        msg: "Ciao, mondo!"
```

---

## Obiettivi del tutorial

* Apprendere variabili, condizioni, cicli e moduli in modo dichiarativo.
* Comprendere differenze tra imperativo e dichiarativo.
* Costruire playbook modulabili e riutilizzabili.
* Confrontare con esempi Python per facilitare l’apprendimento.

---

````

---

# Capitolo 2: Variabili

```markdown
# Capitolo 2: Variabili in Ansible

## Cos'è una Variabile?

Una variabile è un contenitore che memorizza un valore (numero, testo, lista, ecc.) che può cambiare.

## Definire Variabili

In Ansible, si definiscono usando la sezione `vars:`:

```yaml
vars:
  nome: "Mario"
  eta: 30
  hobbies:
    - calcio
    - musica
````

## Usare Variabili

Si usano con la sintassi di interpolazione `{{ variabile }}`:

```yaml
tasks:
  - name: Saluto personalizzato
    debug:
      msg: "Ciao {{ nome }}, hai {{ eta }} anni."
```

## Tipi di Variabili

* Numeri (interi, float)
* Stringhe
* Liste
* Dizionari

## Esempio Completo

```yaml
---
- hosts: localhost
  gather_facts: no

  vars:
    nome: "Anna"
    eta: 25
    hobbies:
      - lettura
      - viaggio

  tasks:
    - name: Stampa il nome
      debug:
        msg: "Nome: {{ nome }}"

    - name: Conta hobby
      debug:
        msg: "Hai {{ hobbies | length }} hobby"

    - name: Primo hobby
      debug:
        msg: "Il primo hobby è {{ hobbies[0] }}"
```

## Confronto con Python

```python
nome = "Anna"
eta = 25
hobbies = ["lettura", "viaggio"]

print(f"Nome: {nome}")
print(f"Hai {len(hobbies)} hobby")
print(f"Il primo hobby è {hobbies[0]}")
```

---

## Note

* In Ansible le variabili sono *immutabili* nel contesto di un playbook.
* Si possono sovrascrivere con variabili d'inventario, o da linea di comando.

---

````

---

# Capitolo 3: Condizioni

```markdown
# Capitolo 3: Condizioni con `when`

## Perché servono le condizioni?

Le condizioni permettono di eseguire certe azioni solo se una condizione è vera.

## Sintassi base

```yaml
tasks:
  - name: Esegui solo se x è maggiore di 10
    debug:
      msg: "x è grande!"
    when: x > 10
````

## Esempio completo

```yaml
---
- hosts: localhost
  gather_facts: no

  vars:
    x: 15

  tasks:
    - name: Controlla valore di x
      debug:
        msg: "x è più grande di 10"
      when: x > 10

    - name: Altrimenti
      debug:
        msg: "x è 10 o meno"
      when: x <= 10
```

## Operatori supportati

* `==`, `!=`, `>`, `<`, `>=`, `<=`
* operatori logici: `and`, `or`, `not`

## Confronto Python

```python
x = 15

if x > 10:
    print("x è più grande di 10")
else:
    print("x è 10 o meno")
```

---

## Nota

* In Ansible `when` è un filtro jinja2, quindi si possono usare espressioni complesse.

---

````

---

# Capitolo 4: Cicli

```markdown
# Capitolo 4: Cicli con `loop`

## Cos'è un ciclo?

Un ciclo ripete un’azione più volte, per ogni elemento di una lista o intervallo.

## Sintassi base con `loop`

```yaml
tasks:
  - name: Saluta utenti
    debug:
      msg: "Ciao {{ item }}"
    loop:
      - Mario
      - Lucia
      - Anna
````

## Variabili nella lista

La variabile `item` contiene l’elemento corrente.

## Esempio completo

```yaml
---
- hosts: localhost
  gather_facts: no

  vars:
    utenti:
      - mario
      - lucia
      - anna

  tasks:
    - name: Saluta ogni utente
      debug:
        msg: "Ciao {{ item }}"
      loop: "{{ utenti }}"
```

## Loop con indici

Per indici o range:

```yaml
tasks:
  - name: Conta da 1 a 5
    debug:
      msg: "Numero {{ item }}"
    loop: "{{ range(1,6) | list }}"
```

## Confronto Python

```python
utenti = ["mario", "lucia", "anna"]

for utente in utenti:
    print(f"Ciao {utente}")

for i in range(1,6):
    print(f"Numero {i}")
```

---

## Nota

* Loop in Ansible è più limitato rispetto a Python (no break, continue).
* Puoi usare `loop_control` per modificare comportamento.

---

````

---

# Capitolo 5: Modularità

```markdown
# Capitolo 5: Modularità con Ruoli

## Perché modularizzare?

I ruoli aiutano a organizzare playbook complessi in parti riutilizzabili.

## Struttura di un ruolo

````

roles/
└── mio_ruolo/
├── tasks/
│   └── main.yml
├── vars/
│   └── main.yml
└── README.md

````

## Come usare un ruolo

Nel playbook:

```yaml
- hosts: localhost
  roles:
    - mio_ruolo
````

## Esempio ruolo `saluto`

`roles/saluto/tasks/main.yml`:

```yaml
- name: Saluto personalizzato
  debug:
    msg: "Ciao {{ nome }}"
```

Playbook che usa il ruolo:

```yaml
---
- hosts: localhost
  gather_facts: no

  vars:
    nome: "Luca"

  roles:
    - saluto
```

## Vantaggi

* Riutilizzo
* Separazione di responsabilità
* Facilità di manutenzione

---

## Nota

* Puoi passare variabili al ruolo in playbook o tramite `defaults/main.yml`.

---

```

---

Se vuoi, posso anche preparare i file Markdown con queste versioni dettagliate o generare ulteriori capitoli su argomenti come gestione errori, template Jinja, callback plugin, ecc.

Fammi sapere!
```


---
---

Perfetto, continuo con ulteriori capitoli approfonditi su:

* Gestione errori e controllo del flusso
* Template Jinja2 in Ansible
* Callback plugin e personalizzazioni

---

# Capitolo 6: Gestione Errori e Controllo del Flusso

````markdown
# Capitolo 6: Gestione Errori e Controllo del Flusso

## Perché gestire errori?

Nei playbook è importante prevedere cosa succede quando un task fallisce per non interrompere l'intera esecuzione senza controllo.

## Controllo errori con `ignore_errors`

Esempio:

```yaml
tasks:
  - name: Esegue un comando che potrebbe fallire
    command: /bin/false
    ignore_errors: yes

  - name: Task successivo che verrà eseguito comunque
    debug:
      msg: "Questo task verrà eseguito anche se il precedente fallisce"
````

Con `ignore_errors: yes`, anche se il task fallisce, l'esecuzione continua.

## Condizione di successo con `failed_when` e `changed_when`

Permette di personalizzare la valutazione di fallimento o cambiamento.

```yaml
tasks:
  - name: Esempio con controllo personalizzato
    shell: /usr/bin/exit 1
    failed_when: false   # Non fallisce mai, anche se exit code è diverso da 0
```

## Blocchi e `rescue`

Permettono di raggruppare task e gestire errori con un meccanismo simile a try/catch.

```yaml
tasks:
  - block:
      - name: Task che potrebbe fallire
        command: /bin/false

      - name: Task successivo
        debug:
          msg: "Non eseguito se il precedente fallisce"

    rescue:
      - name: Gestione errore
        debug:
          msg: "Errore catturato, eseguo recupero"
```

## Condizione `when` per controllare flussi

Puoi saltare task basati sul risultato di task precedenti.

```yaml
tasks:
  - name: Esegue comando
    shell: /bin/false
    register: risultato

  - name: Esegue solo se il task precedente ha avuto successo
    debug:
      msg: "Successo!"
    when: risultato.rc == 0
```

## Confronto Python (try/except)

```python
try:
    # codice che può generare errore
    result = 1 / 0
except ZeroDivisionError:
    print("Gestisco l'errore")
```

---

## Nota

* Gestire bene gli errori è cruciale in automazione per non lasciare ambienti in stato incerto.
* Usare `block` e `rescue` per mantenere playbook robusti e leggibili.

---

````

---

# Capitolo 7: Template Jinja2 in Ansible

```markdown
# Capitolo 7: Template Jinja2 in Ansible

## Cos'è Jinja2?

È un motore di template che permette di generare contenuti dinamici tramite variabili, espressioni e filtri.

## Uso nei file template `.j2`

Puoi creare file template con variabili da sostituire durante l’esecuzione.

Esempio `template.conf.j2`:

````

server {
listen 80;
server_name {{ hostname }};

```
location / {
    proxy_pass http://{{ backend_ip }}:{{ backend_port }};
}
```

}

````

## Uso nel playbook

```yaml
tasks:
  - name: Copia file template
    template:
      src: template.conf.j2
      dest: /etc/nginx/sites-enabled/default
````

## Variabili, filtri e controllo flusso

Jinja2 supporta:

* Variabili `{{ var }}`
* Filtri `{{ var | lower }}`
* Cicli e condizioni `{% if condition %} ... {% endif %}`

Esempio con filtro:

```yaml
vars:
  nome: "Mario Rossi"

tasks:
  - debug:
      msg: "Nome minuscolo: {{ nome | lower }}"
```

Esempio con condizione nel template:

```jinja
{% if app_debug %}
debug_mode = true
{% else %}
debug_mode = false
{% endif %}
```

## Confronto con Python

Jinja2 è simile a string formatting in Python ma più potente e orientato a template.

```python
nome = "Mario"
print(f"Ciao {nome.lower()}")
```

---

## Nota

* Template sono utili per generare file di configurazione, script o documenti.
* Usali per rendere i tuoi playbook più dinamici e flessibili.

---

````

---

# Capitolo 8: Callback Plugin e Personalizzazioni

```markdown
# Capitolo 8: Callback Plugin e Personalizzazioni

## Cosa sono i callback plugin?

Sono plugin che consentono di eseguire azioni personalizzate durante o dopo l’esecuzione dei playbook (ad es. log, notifiche).

## Uso base

Ansible include diversi callback di default (json, yaml, minimal).

Per abilitarli:

```bash
export ANSIBLE_CALLBACK_WHITELIST='json'
ansible-playbook playbook.yml
````

## Scrivere un callback personalizzato

Si scrive un file Python che definisce metodi come `v2_runner_on_ok` per gestire eventi.

Esempio base:

```python
from ansible.plugins.callback import CallbackBase

class CallbackModule(CallbackBase):
    def v2_runner_on_ok(self, result):
        host = result._host
        print(f"TASK OK su {host.name}: {result.task_name}")
```

Salvalo in `callback_plugins/mio_callback.py` e abilitalo.

## Perché usarlo?

* Monitoraggio personalizzato
* Integrazione con sistemi esterni (Slack, email)
* Logging avanzato

## Alternative: Moduli di output

Alcuni plugin modificano il formato d’output (ad esempio per pipeline CI/CD).

---

## Nota

* La creazione di callback plugin richiede Python e conoscenza Ansible internals.
* Utile per progetti avanzati e personalizzati.

---

```

---

Se vuoi, posso proseguire creando esempi pratici, esercizi o capitoli avanzati (es. gestione inventario dinamico, sviluppo moduli personalizzati, ecc.).

Fammi sapere!
```


---
---

Perfetto! Procediamo con esempi pratici, esercizi, e poi approfondiamo con capitoli avanzati come gestione inventario dinamico e sviluppo di moduli personalizzati in Ansible.

---

# Esempi Pratici e Esercizi

---

## Esempio pratico 1: Installare e configurare Nginx con template

```yaml
---
- name: Setup Nginx with template
  hosts: webservers
  vars:
    server_name: example.com
  tasks:
    - name: Install Nginx
      apt:
        name: nginx
        state: present
      become: yes

    - name: Copy Nginx config template
      template:
        src: nginx.conf.j2
        dest: /etc/nginx/sites-available/default
      notify: restart nginx

  handlers:
    - name: restart nginx
      service:
        name: nginx
        state: restarted
```

`nginx.conf.j2`:

```jinja
server {
    listen 80;
    server_name {{ server_name }};
    location / {
        proxy_pass http://localhost:3000;
    }
}
```

---

## Esercizio 1: Scrivi un playbook che crea un utente con un gruppo specifico, usando variabili e condizioni.

---

## Esempio pratico 2: Gestione errori con block e rescue

```yaml
---
- name: Example error handling
  hosts: localhost
  tasks:
    - block:
        - name: Command that fails
          command: /bin/false
        - name: Should not run if above fails
          debug:
            msg: "This won't run"
      rescue:
        - name: Handle failure
          debug:
            msg: "Something went wrong, handling it"
```

---

## Esercizio 2: Modifica l’esempio sopra per registrare l’output del comando fallito e usarlo nel rescue.

---

# Capitoli Avanzati

---

## Capitolo 9: Gestione Inventario Dinamico

````markdown
# Capitolo 9: Gestione Inventario Dinamico

## Cos’è l’inventario dinamico?

Invece di una lista statica di host, l’inventario può essere generato al volo da script, API o cloud provider.

## Esempio: Script inventario JSON

```bash
#!/bin/bash
cat <<EOF
{
  "all": {
    "hosts": ["host1.example.com", "host2.example.com"],
    "vars": {"ansible_user": "admin"}
  }
}
EOF
````

Salva come `dynamic_inventory.sh`, rendilo eseguibile e usa:

```bash
ansible-inventory -i dynamic_inventory.sh --list
```

## Cloud provider

Ansible ha plugin ufficiali per inventari dinamici come AWS EC2, GCP, Azure, OpenStack.

Configura un file YAML con le credenziali e usa il plugin.

## Vantaggi

* Automatizza il reperimento degli host
* Sempre aggiornato
* Si integra con ambienti cloud e container

---

## Nota

* Il formato JSON o YAML è il più usato per l’output dello script
* Gli script possono essere scritti in qualsiasi linguaggio

---

````

---

## Capitolo 10: Sviluppo di Moduli Personalizzati

```markdown
# Capitolo 10: Sviluppo di Moduli Personalizzati

## Perché sviluppare moduli?

Quando i moduli ufficiali non soddisfano i requisiti, si può estendere Ansible con moduli custom.

## Struttura base di un modulo in Python

```python
#!/usr/bin/python

from ansible.module_utils.basic import AnsibleModule

def main():
    module_args = dict(
        name=dict(type='str', required=True),
        state=dict(type='str', choices=['present', 'absent'], default='present')
    )

    module = AnsibleModule(argument_spec=module_args, supports_check_mode=True)

    name = module.params['name']
    state = module.params['state']

    result = dict(changed=False, original_name=name)

    if state == 'present':
        # Logica per creare risorsa
        result['changed'] = True
        result['message'] = f"Resource {name} created."
    else:
        # Logica per rimuovere risorsa
        result['changed'] = True
        result['message'] = f"Resource {name} removed."

    module.exit_json(**result)

if __name__ == '__main__':
    main()
````

## Testare il modulo

Salva il modulo in `library/my_module.py` e usalo così:

```yaml
- hosts: localhost
  tasks:
    - name: Test custom module
      my_module:
        name: test
        state: present
```

## Best Practice

* Supportare `check_mode` per idempotenza
* Gestire errori con `module.fail_json()`
* Documentare i parametri

---

## Nota

* Puoi scrivere moduli in Python, Bash o altri linguaggi, purché rispettino il protocollo di comunicazione JSON

---

```

---

# Posso proseguire con:

- Capitolo 11: Gestione avanzata variabili e facts
- Capitolo 12: Strategie di deployment avanzate
- Esempi di playbook reali
- Laboratori pratici con soluzioni

Fammi sapere! Vuoi che approfondisca uno di questi o altro?
```


---
---

Perfetto! Procedo con i capitoli successivi dettagliati su:

* Gestione avanzata variabili e facts
* Strategie di deployment avanzate
* Esempi di playbook reali
* Laboratori pratici con soluzioni

---

# Capitolo 11: Gestione avanzata variabili e facts

````markdown
# Capitolo 11: Gestione avanzata variabili e facts

## Introduzione

Le variabili sono il cuore della flessibilità in Ansible. Possono provenire da:

- File di variabili (`vars_files`)
- Inventario
- Ruoli (`defaults` e `vars`)
- Facts raccolti dinamicamente dal target
- Parametri in linea (`--extra-vars`)

---

## Ordine di precedenza variabili

1. Extra vars (parametri CLI)
2. Variabili definite nei playbook o ruoli
3. Variabili di inventario
4. Facts raccolti dal sistema
5. Variabili di default

---

## Uso dei Facts

Facts sono informazioni raccolte dal target tramite `setup` module (di default eseguito su ogni host).

Esempio di facts:

```yaml
ansible_facts:
  ansible_hostname: myhost
  ansible_os_family: Debian
  ansible_processor_cores: 4
````

---

## Accesso ai facts

Nel playbook puoi accedere a facts come variabili:

```yaml
- debug:
    msg: "Hostname is {{ ansible_facts.ansible_hostname }}"
```

---

## Variabili complesse

Puoi definire variabili strutturate (dizionari, liste):

```yaml
vars:
  users:
    - name: alice
      shell: /bin/bash
    - name: bob
      shell: /bin/zsh
```

Iterare su liste:

```yaml
- name: Create users
  user:
    name: "{{ item.name }}"
    shell: "{{ item.shell }}"
  loop: "{{ users }}"
```

---

## Variabili dinamiche con `set_fact`

Usa `set_fact` per definire variabili a runtime:

```yaml
- set_fact:
    my_dynamic_var: "valore calcolato"
```

---

## Gestione scope variabili

* Variabili definite in un ruolo sono isolate a quel ruolo
* Variabili di playbook sono visibili a tutto il play
* Evitare conflitti di nomi per mantenere pulito il contesto

---

## Esercizio

1. Definisci un playbook che usa facts per eseguire task solo su host con sistema operativo Ubuntu.
2. Usa `set_fact` per calcolare e passare un valore dinamico.

````

---

# Capitolo 12: Strategie di deployment avanzate

```markdown
# Capitolo 12: Strategie di deployment avanzate

## Introduzione

In ambienti reali il deployment richiede strategie che minimizzino downtime, gestiscano rollback e assicurino coerenza.

---

## Strategie comuni

### Rolling Update

Aggiorna i nodi uno alla volta per minimizzare impatto.

```yaml
- hosts: webservers
  serial: 1
  tasks:
    - name: Deploy new version
      shell: ./deploy.sh
````

### Blue/Green Deployment

Mantieni due ambienti (blue e green), cambia il traffico quando pronto.

Non nativamente supportato in Ansible ma gestibile con orchestration esterna.

---

## Gestione rollback

Usa handler e registri per eseguire rollback in caso di fallimenti.

Esempio:

```yaml
- block:
    - name: Deploy applicazione
      shell: ./deploy.sh
  rescue:
    - name: Rollback deploy
      shell: ./rollback.sh
```

---

## Uso di tags

Tags permettono di eseguire solo parti del playbook:

```bash
ansible-playbook playbook.yml --tags "deploy"
```

---

## Gestione segreti

Integra con Vault per cifrare segreti.

---

## Esercizio

1. Scrivi un playbook con strategia rolling update usando `serial`.
2. Aggiungi gestione rollback con blocchi `block` e `rescue`.

````

---

# Esempi di Playbook Reali

---

## Esempio: Setup di un server web completo

```yaml
---
- name: Setup webserver completo
  hosts: webservers
  vars_files:
    - secrets.yml

  tasks:
    - name: Installare Nginx e Git
      apt:
        name:
          - nginx
          - git
        state: present
      become: yes

    - name: Configurare sito web con template
      template:
        src: site.conf.j2
        dest: /etc/nginx/sites-available/site.conf
      notify:
        - reload nginx

    - name: Clonare repository sito
      git:
        repo: "{{ repo_url }}"
        dest: /var/www/html
        version: master

  handlers:
    - name: reload nginx
      service:
        name: nginx
        state: reloaded
````

---

# Laboratori Pratici con Soluzioni

---

## Laboratorio 1: Installare e configurare un servizio

**Obiettivo**: Scrivere un playbook che:

* Installa Docker
* Aggiunge utente al gruppo docker
* Avvia un container nginx

---

### Soluzione

```yaml
---
- name: Install Docker e nginx container
  hosts: all
  become: yes

  tasks:
    - name: Installare dipendenze
      apt:
        name: ['apt-transport-https', 'ca-certificates', 'curl', 'software-properties-common']
        state: present

    - name: Aggiungere chiave GPG Docker
      apt_key:
        url: https://download.docker.com/linux/ubuntu/gpg
        state: present

    - name: Aggiungere repository Docker
      apt_repository:
        repo: deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable
        state: present

    - name: Installare Docker
      apt:
        name: docker-ce
        state: present
        update_cache: yes

    - name: Aggiungere utente corrente al gruppo docker
      user:
        name: "{{ ansible_user }}"
        groups: docker
        append: yes

    - name: Avviare container nginx
      docker_container:
        name: nginx
        image: nginx:latest
        state: started
        ports:
          - "80:80"
```

---

Se vuoi posso procedere con più laboratori, approfondimenti su callback plugin, template avanzati, oppure aiutarti a costruire esercizi personalizzati. Dimmi pure!


---
---

Perfetto! Ti fornisco ora una serie di **laboratori pratici** aggiuntivi e **approfondimenti su callback plugin** e **template avanzati** in Ansible. Ogni sezione è ben commentata e pronta per essere integrata nel manuale che stiamo costruendo.

---

# Laboratori Pratici Aggiuntivi

---

## Laboratorio 2: Gestione utenti e gruppi

**Obiettivo:** Creare un playbook che aggiunge utenti con gruppi specifici, assegna password criptate e configura SSH.

```yaml
---
- name: Gestione utenti e gruppi
  hosts: all
  become: yes

  vars:
    users:
      - name: alice
        groups: sudo,developers
        ssh_key: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC..."
      - name: bob
        groups: developers
        ssh_key: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC..."

  tasks:
    - name: Creare gruppi
      group:
        name: "{{ item }}"
        state: present
      loop:
        - sudo
        - developers

    - name: Creare utenti con gruppi e password
      user:
        name: "{{ item.name }}"
        groups: "{{ item.groups }}"
        password: "{{ 'password123' | password_hash('sha512') }}"
        shell: /bin/bash
        state: present
      loop: "{{ users }}"

    - name: Creare directory .ssh per ogni utente
      file:
        path: "/home/{{ item.name }}/.ssh"
        state: directory
        mode: "0700"
        owner: "{{ item.name }}"
        group: "{{ item.name }}"
      loop: "{{ users }}"

    - name: Aggiungere chiave pubblica ssh per ogni utente
      copy:
        content: "{{ item.ssh_key }}"
        dest: "/home/{{ item.name }}/.ssh/authorized_keys"
        mode: "0600"
        owner: "{{ item.name }}"
        group: "{{ item.name }}"
      loop: "{{ users }}"
```

---

## Laboratorio 3: Deploy di un’applicazione Python con virtualenv

**Obiettivo:** Setup ambiente virtuale Python, installare dipendenze e avviare applicazione.

```yaml
---
- name: Deploy app Python con virtualenv
  hosts: all
  become: yes

  vars:
    app_dir: /opt/myapp
    venv_dir: "{{ app_dir }}/venv"

  tasks:
    - name: Installare Python3 e pip
      apt:
        name:
          - python3
          - python3-pip
          - python3-venv
        state: present
        update_cache: yes

    - name: Creare directory applicazione
      file:
        path: "{{ app_dir }}"
        state: directory
        owner: www-data
        group: www-data

    - name: Creare virtualenv
      command: python3 -m venv "{{ venv_dir }}"
      args:
        creates: "{{ venv_dir }}/bin/activate"

    - name: Installare dipendenze Python
      pip:
        requirements: "{{ app_dir }}/requirements.txt"
        virtualenv: "{{ venv_dir }}"

    - name: Avviare app (esempio semplice)
      shell: "{{ venv_dir }}/bin/python {{ app_dir }}/app.py &"
      args:
        chdir: "{{ app_dir }}"
```

---

# Approfondimenti: Callback Plugin

---

## Cosa sono i callback plugin?

I callback plugin in Ansible sono moduli Python che intercettano gli eventi durante l’esecuzione di playbook e task. Permettono di personalizzare output, inviare notifiche, registrare dati, integrare sistemi esterni.

---

## Uso pratico

Per esempio, si può usare un callback plugin per:

* Inviare notifiche Slack al completamento di un playbook
* Salvare i log in un database esterno
* Visualizzare output personalizzato in tempo reale

---

## Esempio: Callback plugin base (in Python)

```python
from ansible.plugins.callback import CallbackBase

class CallbackModule(CallbackBase):
    def v2_runner_on_ok(self, result):
        host = result._host.get_name()
        task = result.task_name
        print(f"TASK OK on {host}: {task}")

    def v2_runner_on_failed(self, result, ignore_errors=False):
        host = result._host.get_name()
        task = result.task_name
        print(f"TASK FAILED on {host}: {task}")
```

---

## Come usarlo?

* Posiziona il file `.py` in una cartella `callback_plugins/` nel progetto
* Setta la variabile d’ambiente `ANSIBLE_CALLBACK_PLUGINS` per puntare alla cartella
* Esegui il playbook, il plugin verrà caricato automaticamente

---

# Approfondimenti: Template Jinja2 Avanzati

---

## Uso base

Ansible usa Jinja2 per generare contenuti dinamici, es. file di configurazione.

```yaml
template:
  src: nginx.conf.j2
  dest: /etc/nginx/nginx.conf
```

---

## Filtri utili

* `{{ var | default('valore') }}` — valore di fallback
* `{{ lista | join(', ') }}` — unisce lista con separatore
* `{{ testo | upper }}` — maiuscole

---

## Controlli di flusso

```jinja
{% if ansible_os_family == "Debian" %}
  # Configurazione specifica Debian
{% else %}
  # Altri OS
{% endif %}
```

---

## Cicli

```jinja
{% for utente in users %}
useradd {{ utente.name }}
{% endfor %}
```

---

## Esempio avanzato: template nginx

```jinja
server {
  listen 80;
  server_name {{ domain_name }};

  location / {
    proxy_pass http://{{ backend_ip }}:{{ backend_port }};
  }

  {% if enable_ssl %}
  listen 443 ssl;
  ssl_certificate /etc/ssl/certs/{{ domain_name }}.crt;
  ssl_certificate_key /etc/ssl/private/{{ domain_name }}.key;
  {% endif %}
}
```

---

## Esercizio

Scrivi un template per un file di configurazione che gestisca dinamicamente più host backend in un load balancer Nginx.

---

Se vuoi, posso procedere con ulteriori laboratori su:

* Gestione inventario dinamico
* Scrittura moduli personalizzati
* Integrazione con sistemi esterni via plugin

Fammi sapere!


---
---

Perfetto! Ti do un piano rapido per i prossimi passi, così continuiamo a costruire il manuale con laboratori avanzati e approfondimenti pratici:

---

## Prossimi laboratori/pratiche

1. **Gestione inventario dinamico**
   *Come usare script, plugin o API per popolare dinamicamente l’inventario di Ansible*
   — Con esempi su AWS EC2, DigitalOcean, o file JSON dinamici.

2. **Scrittura moduli personalizzati**
   *Come estendere Ansible con moduli Python custom*
   — Spiegazione API moduli, gestione input/output, idempotenza.

3. **Callback plugin avanzati**
   *Notifiche, logging esteso, integrazione con sistemi esterni*
   — Plugin per Slack, webhook, archiviazione DB.

4. **Template avanzati e filtri Jinja2 personalizzati**
   *Creazione di filtri personalizzati, macro e blocchi*
   — Esempi pratici per gestire configurazioni complesse.

5. **Gestione errori e strategie di retry**
   *Come gestire errori e fallback senza introdurre logica imperativa*
   — Uso di `ignore_errors`, `rescue`, `always`.

6. **Integrazione con CI/CD (GitHub Actions, OpenTofu)**
   *Come integrare playbook in pipeline di automazione*
   — Esempi di workflow e best practice.

---

Se vuoi, posso partire con uno di questi o un mix, o generare i contenuti singoli e completi da subito. Dimmi pure!

---

Se vuoi, ti preparo anche una versione PDF o Markdown formattata con tutto il materiale finora, così hai una base documentale completa.

---

Fammi sapere come vuoi procedere! 😊


---
---

Perfetto! Ti preparo un **mix introduttivo** che tocca i punti chiave di ciascuno di questi argomenti avanzati, con esempi pratici e consigli, e poi procedo a generare i contenuti singoli e completi per ogni capitolo.

---

# Introduzione ai moduli avanzati di Ansible con esempi pratici

---

## 1. Gestione inventario dinamico

**Concetto:**
L’inventario di Ansible definisce i target su cui eseguire i playbook. Un inventario dinamico permette di avere una lista aggiornata automaticamente da fonti esterne come cloud provider o database.

**Perché usarlo:**

* Evita inventari statici, difficile da mantenere.
* Sincronizza i server attivi in tempo reale.

**Esempio:** inventario dinamico AWS EC2 con script Python o JSON:

```bash
ansible-inventory -i ec2.py --list
```

O con plugin nativo `aws_ec2`:

```yaml
plugin: aws_ec2
regions:
  - us-east-1
filters:
  tag:Environment: production
```

---

## 2. Sviluppo moduli personalizzati

**Concetto:**
I moduli sono i mattoni fondamentali di Ansible: ogni task chiama un modulo che compie un’azione idempotente. Quando serve qualcosa di specifico, si può scrivere un modulo Python personalizzato.

**Struttura base di un modulo Python:**

```python
#!/usr/bin/python

from ansible.module_utils.basic import AnsibleModule

def main():
    module = AnsibleModule(
        argument_spec=dict(
            name=dict(type='str', required=True),
            state=dict(type='str', choices=['present', 'absent'], default='present')
        )
    )

    name = module.params['name']
    state = module.params['state']

    # Logica idempotente simulata
    changed = False
    if state == 'present':
        # implementa la creazione
        changed = True
    else:
        # implementa la rimozione
        changed = True

    module.exit_json(changed=changed, msg=f"Resource {name} is {state}")

if __name__ == '__main__':
    main()
```

---

## 3. Callback plugin avanzati

**Concetto:**
I callback plugin permettono di intercettare eventi durante l’esecuzione di Ansible (es. task started, task finished), per log personalizzati o notifiche.

**Esempio di callback per inviare notifiche Slack:**

```python
from ansible.plugins.callback import CallbackBase

class CallbackModule(CallbackBase):
    def v2_runner_on_ok(self, result):
        msg = f"Task {result.task_name} eseguito con successo su {result._host}"
        # codice per inviare a Slack via webhook
```

---

## 4. Template avanzati e filtri Jinja2

**Concetto:**
Jinja2 è il motore di template usato da Ansible per interpolare variabili e logica di base in file di configurazione. È possibile creare filtri personalizzati per manipolare dati complessi.

**Esempio filtro personalizzato:**

```python
def reverse_string(value):
    return value[::-1]

class FilterModule(object):
    def filters(self):
        return {'reverse': reverse_string}
```

Uso nel template:

```jinja
{{ "ciao" | reverse }}  # "oaic"
```

---

## 5. Gestione errori e retry

**Concetto:**
Ansible evita la logica imperativa, ma fornisce meccanismi per gestire errori e tentare retry in modo dichiarativo.

**Esempio di retry in task:**

```yaml
- name: Copia file con retry
  copy:
    src: file.txt
    dest: /tmp/file.txt
  retries: 3
  delay: 5
  until: result is succeeded
  register: result
```

**Esempio di gestione errori con `block` e `rescue`:**

```yaml
tasks:
  - block:
      - name: Comando che può fallire
        command: /bin/false
    rescue:
      - name: Task alternativo
        debug:
          msg: "Comando fallito, eseguo azione di fallback"
```

---

## 6. Integrazione CI/CD (GitHub Actions / OpenTofu)

**Concetto:**
I playbook Ansible possono essere eseguiti automaticamente all’interno di pipeline di integrazione continua.

**Esempio GitHub Actions snippet:**

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Ansible Playbook
        uses: dawidd6/action-ansible-playbook@v2
        with:
          playbook: deploy.yml
```

---

---

# Prossimo step: contenuti dettagliati

Se vuoi, posso ora generarti uno ad uno i capitoli completi con:

* Introduzione teorica
* Spiegazioni tecniche dettagliate
* Esempi pratici commentati
* Esercizi e suggerimenti di approfondimento

Dimmi pure quale capitolo preferisci come primo, o se vuoi che proceda in ordine!


---
---

Perfetto! Procediamo con un **capitolo dettagliato sui Plugin in Ansible**, focalizzandoci in particolare sui **Callback Plugin**, ma con cenni anche agli altri tipi di plugin più comuni, come quelli per connection, lookup, filter, ecc.

---

# Capitolo: Plugin in Ansible — Focus su Callback Plugin e oltre

---

## 1. Introduzione ai Plugin in Ansible

Ansible è altamente estensibile grazie a un sistema di plugin, che permette di personalizzare e estendere il comportamento di Ansible durante l’esecuzione dei playbook.

### Tipologie principali di plugin:

| Tipo plugin    | Descrizione                                                                                    | Esempio uso                               |
| -------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **Callback**   | Reagisce a eventi runtime (task started, finished, error) per logging, notifiche, statistiche. | Notifica Slack, output personalizzato.    |
| **Connection** | Gestisce come Ansible si connette agli host (ssh, local, docker).                              | Connessione SSH o connessione Docker.     |
| **Lookup**     | Recupera dati da fonti esterne (file, database, API).                                          | Lettura variabili da file JSON.           |
| **Filter**     | Funzioni per manipolare dati in Jinja2 templates.                                              | Custom filter per trasformazioni stringa. |
| **Strategy**   | Controlla come vengono eseguiti i task (parallelismo, serializzazione).                        | Linear, Free strategy.                    |
| **Action**     | Definisce il comportamento di un modulo durante l’esecuzione.                                  | Moduli personalizzati avanzati.           |

---

## 2. Focus: Callback Plugin

### 2.1 Cosa sono i Callback Plugin?

I callback plugin intercettano eventi che Ansible genera durante l’esecuzione di un playbook. Possono modificare o estendere:

* L’output a video o su file (logging)
* Invio notifiche (Slack, email)
* Invio metriche a sistemi di monitoring
* Azioni custom post-task o post-playbook

### 2.2 Dove si trovano i callback plugin?

Nel codice Ansible, di solito in `/usr/lib/python3.x/site-packages/ansible/plugins/callback/`

Possono anche essere scritti e usati localmente in:

```
./callback_plugins/
```

---

## 3. Come scrivere un Callback Plugin personalizzato

### 3.1 Struttura minima di un callback plugin

```python
from ansible.plugins.callback import CallbackBase

class CallbackModule(CallbackBase):

    def v2_runner_on_ok(self, result):
        # Quando un task ha successo su un host
        host = result._host.get_name()
        task = result.task_name
        print(f"[OK] Task '{task}' completato su {host}")

    def v2_runner_on_failed(self, result, ignore_errors=False):
        # Quando un task fallisce
        host = result._host.get_name()
        task = result.task_name
        print(f"[FAIL] Task '{task}' fallito su {host}")
```

### 3.2 Eventi utili da intercettare (metodi comuni)

| Metodo                 | Descrizione                         |
| ---------------------- | ----------------------------------- |
| `v2_playbook_on_start` | Quando inizia un playbook           |
| `v2_runner_on_ok`      | Quando un task finisce con successo |
| `v2_runner_on_failed`  | Quando un task fallisce             |
| `v2_runner_on_skipped` | Quando un task è saltato            |
| `v2_playbook_on_stats` | Quando il playbook termina          |

---

## 4. Esempio pratico: Callback per inviare notifiche Slack

```python
import requests
from ansible.plugins.callback import CallbackBase

class CallbackModule(CallbackBase):

    CALLBACK_VERSION = 2.0
    CALLBACK_TYPE = 'notification'
    CALLBACK_NAME = 'slack_notify'

    def __init__(self):
        super(CallbackModule, self).__init__()
        self.webhook_url = 'https://hooks.slack.com/services/XXX/YYY/ZZZ'  # Sostituire con il vostro webhook

    def v2_runner_on_ok(self, result):
        host = result._host.get_name()
        task = result.task_name
        msg = f":white_check_mark: Task '{task}' completato su {host}"
        self.send_slack(msg)

    def v2_runner_on_failed(self, result, ignore_errors=False):
        host = result._host.get_name()
        task = result.task_name
        msg = f":x: Task '{task}' fallito su {host}"
        self.send_slack(msg)

    def send_slack(self, message):
        payload = {"text": message}
        try:
            requests.post(self.webhook_url, json=payload)
        except Exception as e:
            self._display.warning(f"Errore invio Slack: {e}")
```

---

## 5. Installazione e attivazione del plugin

1. Copiare il file `slack_notify.py` nella cartella `callback_plugins` nella root del progetto Ansible.
2. Configurare Ansible per usarlo modificando `ansible.cfg`:

```ini
[defaults]
callback_plugins = ./callback_plugins
stdout_callback = slack_notify
```

---

## 6. Esempio avanzato: Callback plugin con logging su file

```python
from ansible.plugins.callback import CallbackBase
import logging

class CallbackModule(CallbackBase):

    CALLBACK_VERSION = 2.0
    CALLBACK_TYPE = 'notification'
    CALLBACK_NAME = 'file_logger'

    def __init__(self):
        super().__init__()
        logging.basicConfig(filename='ansible.log', level=logging.INFO,
                            format='%(asctime)s %(message)s')
    
    def v2_runner_on_ok(self, result):
        host = result._host.get_name()
        task = result.task_name
        logging.info(f"[OK] Task '{task}' eseguito su {host}")

    def v2_runner_on_failed(self, result, ignore_errors=False):
        host = result._host.get_name()
        task = result.task_name
        logging.error(f"[FAIL] Task '{task}' fallito su {host}")
```

---

## 7. Altri plugin: brevi cenni

* **Filter plugin:** si creano estensioni di filtri Jinja2 per manipolare dati.
* **Lookup plugin:** per caricare dati da fonti esterne.
* **Connection plugin:** per definire nuovi metodi di connessione, es. custom ssh o API.

---

## 8. Esercizi consigliati

* Scrivi un callback plugin che invii notifiche via email in caso di fallimento.
* Implementa un filter plugin che converta tutte le stringhe in maiuscolo.
* Prova a creare un lookup plugin che legga variabili da un file JSON esterno.

---

Se vuoi, posso ora generarti il file completo di esempio (ad es. `callback_plugins/slack_notify.py`) con commenti riga per riga, o passare a un altro tipo di plugin.

Fammi sapere!


---
---

Eccoti il file completo di esempio per un **Callback Plugin Ansible** che invia notifiche a Slack in caso di task riusciti o falliti.

---

```python
# callback_plugins/slack_notify.py

"""
Callback Plugin Ansible: Slack Notify

Questo plugin invia notifiche su Slack per ogni task eseguito da Ansible.
In particolare:
- Invia un messaggio quando un task ha successo (OK)
- Invia un messaggio quando un task fallisce (FAIL)

Per usarlo:
1. Metti questo file nella cartella 'callback_plugins' nella root del progetto Ansible
2. Configura ansible.cfg con:
   [defaults]
   callback_plugins = ./callback_plugins
   stdout_callback = slack_notify

Sostituisci 'self.webhook_url' con il tuo webhook Slack personale.

Autore: ChatGPT
"""

import requests
from ansible.plugins.callback import CallbackBase

class CallbackModule(CallbackBase):
    # Versione del callback API
    CALLBACK_VERSION = 2.0
    
    # Tipo di callback (notification, stdout, etc.)
    CALLBACK_TYPE = 'notification'
    
    # Nome del plugin (usato in ansible.cfg)
    CALLBACK_NAME = 'slack_notify'

    def __init__(self):
        super(CallbackModule, self).__init__()
        # Inserisci qui il webhook Slack del tuo workspace
        self.webhook_url = 'https://hooks.slack.com/services/XXX/YYY/ZZZ'  # <== MODIFICA QUI

    def v2_runner_on_ok(self, result):
        """
        Metodo chiamato quando un task viene eseguito con successo.
        """
        host = result._host.get_name()           # Nome host target
        task = result.task_name                   # Nome task
        msg = f":white_check_mark: Task '{task}' completato con successo su *{host}*"
        self.send_slack(msg)

    def v2_runner_on_failed(self, result, ignore_errors=False):
        """
        Metodo chiamato quando un task fallisce.
        """
        host = result._host.get_name()
        task = result.task_name
        msg = f":x: Task '{task}' *fallito* su *{host}*"
        self.send_slack(msg)

    def send_slack(self, message):
        """
        Funzione helper per inviare un messaggio a Slack tramite webhook.
        """
        payload = {"text": message}
        try:
            response = requests.post(self.webhook_url, json=payload)
            response.raise_for_status()
        except Exception as e:
            # Usa il display interno di Ansible per mostrare warning in caso di errori
            self._display.warning(f"Errore nell'invio notifica Slack: {e}")
```

---

**Come funziona:**

* `CallbackModule` è la classe che Ansible carica come plugin.
* `v2_runner_on_ok` e `v2_runner_on_failed` intercettano rispettivamente eventi di successo e fallimento dei task.
* Il messaggio formattato viene inviato al webhook Slack.
* In caso di errore di rete, viene mostrato un warning.

---

Se vuoi posso aiutarti a creare anche una versione che manda notifiche su altri canali o più funzionale! Vuoi?


---
---

Perfetto! Ti fornisco ora esempi completi e commentati per i tre tipi di plugin Ansible che hai citato:

---

# 1. Filter Plugin

Estende i filtri Jinja2 usati nei template o playbook.
Esempio: un filtro che converte una stringa in camelCase.

```python
# filter_plugins/camelcase.py

"""
Filter Plugin Ansible: CamelCase

Fornisce un filtro Jinja2 chiamato 'camelcase' che converte una stringa in camelCase.

Uso nel template/playbook:
  {{ "ciao mondo" | camelcase }}  => "ciaoMondo"
"""

class FilterModule(object):
    def filters(self):
        return {
            'camelcase': self.camelcase_filter
        }

    def camelcase_filter(self, value):
        """
        Converte una stringa in camelCase.
        """
        words = value.split()
        if not words:
            return ""
        first_word = words[0].lower()
        capitalized = [w.capitalize() for w in words[1:]]
        return first_word + ''.join(capitalized)
```

---

# 2. Lookup Plugin

Carica dati da una fonte esterna.
Esempio: lookup che legge un file JSON remoto via HTTP.

```python
# lookup_plugins/httpjson.py

"""
Lookup Plugin Ansible: HTTP JSON

Carica dati JSON da una URL HTTP.

Uso:
  - debug:
      msg: "{{ lookup('httpjson', 'https://api.example.com/data.json') }}"
"""

from ansible.plugins.lookup import LookupBase
from ansible.errors import AnsibleError
import requests

class LookupModule(LookupBase):
    def run(self, terms, variables=None, **kwargs):
        url = terms[0]
        try:
            r = requests.get(url)
            r.raise_for_status()
            return [r.json()]
        except Exception as e:
            raise AnsibleError(f"Errore nel caricamento JSON da {url}: {e}")
```

---

# 3. Connection Plugin

Definisce un nuovo metodo di connessione.
Esempio: connessione via API REST (fittizia e semplificata).

```python
# connection_plugins/restapi.py

"""
Connection Plugin Ansible: REST API

Esempio base di connessione ad un host tramite API REST.

Per usare:
ansible_connection: restapi
"""

from ansible.plugins.connection import ConnectionBase
from ansible.errors import AnsibleConnectionFailure
import requests

class Connection(ConnectionBase):
    def __init__(self, *args, **kwargs):
        super(Connection, self).__init__(*args, **kwargs)
        self.base_url = None
        self.session = None

    def _connect(self):
        """
        Stabilisce connessione (in questo caso solo inizializza sessione).
        """
        self.base_url = self.get_option('remote_addr')  # es: https://api.targethost.com
        if not self.base_url:
            raise AnsibleConnectionFailure("URL base mancante per connessione REST")
        self.session = requests.Session()

    def exec_command(self, cmd, in_data=None, sudoable=True):
        """
        Esegue un comando sulla destinazione tramite API REST (ipotetico).
        """
        if self.session is None:
            self._connect()
        url = f"{self.base_url}/exec"
        payload = {"command": cmd}
        try:
            r = self.session.post(url, json=payload)
            r.raise_for_status()
            return 0, r.text, ""
        except Exception as e:
            raise AnsibleConnectionFailure(f"Errore esecuzione comando: {e}")

    def close(self):
        """
        Chiude la connessione (qui chiude sessione HTTP).
        """
        if self.session:
            self.session.close()
            self.session = None
```

---

# Come usarli?

* **Filter plugin**: salvalo in `filter_plugins/`, poi in playbook:

```yaml
- debug:
    msg: "{{ 'ciao mondo' | camelcase }}"
```

* **Lookup plugin**: salvalo in `lookup_plugins/`, poi in playbook:

```yaml
- debug:
    msg: "{{ lookup('httpjson', 'https://jsonplaceholder.typicode.com/todos/1') }}"
```

* **Connection plugin**: salvalo in `connection_plugins/`, e in inventory:

```ini
[targethost]
api.example.com ansible_connection=restapi ansible_remote_addr=https://api.example.com
```

---

Se vuoi, posso aiutarti a generare altri plugin avanzati o tutorial dettagliati sull'uso e lo sviluppo di plugin Ansible!


---
---

Ottima domanda! Capire la differenza tra **moduli personalizzati** e **plugin** in Ansible è fondamentale per usare al meglio l’estensibilità del sistema.

---

## 1. **Moduli personalizzati**

### Cos’è un modulo?

* È **l’unità base di lavoro in Ansible**: un piccolo script (in Python o altro) che esegue un’azione specifica (es. installare un pacchetto, copiare un file, creare un utente).
* Viene **invocato direttamente dal playbook** come task.
* Il modulo prende in input parametri, esegue operazioni e restituisce uno stato (changed, failed, output, ecc.).

### Quando si usano?

* Quando vuoi **definire una nuova azione o gestione risorse** che Ansible non supporta nativamente.
* Per esempio, se vuoi interagire con un’API proprietaria, un servizio custom, o gestire risorse non standard.

### Caratteristiche

* Autonomo e riutilizzabile.
* Funziona sia in locale che su host remoti.
* Deve essere idempotente: ripetere il modulo non deve creare effetti collaterali.
* Scrittura tipicamente in Python (ma può essere anche in bash, powershell, ecc.).

### Esempio minimo di modulo Python

```python
#!/usr/bin/python

from ansible.module_utils.basic import AnsibleModule

def main():
    module_args = dict(
        name=dict(type='str', required=True),
        state=dict(type='str', choices=['present', 'absent'], default='present')
    )

    module = AnsibleModule(argument_spec=module_args)

    name = module.params['name']
    state = module.params['state']

    # Logica fittizia: simuliamo la presenza di una risorsa
    changed = False
    if state == 'present':
        # crea risorsa se non esiste
        changed = True
    else:
        # elimina risorsa se esiste
        changed = True

    module.exit_json(changed=changed, msg=f"Risorsa {name} è ora {state}")

if __name__ == '__main__':
    main()
```

---

## 2. **Plugin Ansible**

### Cos’è un plugin?

* È un **componente estensibile** che modifica o estende il comportamento interno di Ansible.
* Non è un task/azione, ma più una **funzionalità di supporto o hook**.
* Tipologie di plugin comuni:

  * **Callback plugin** (es. logging, notifica eventi)
  * **Filter plugin** (filtri Jinja2 personalizzati)
  * **Lookup plugin** (caricamento dati esterni)
  * **Connection plugin** (definisce il metodo di connessione)
  * **Strategy plugin** (gestione esecuzione task)
  * **Inventory plugin** (gestione inventari dinamici)
  * **Action plugin** (modifica esecuzione moduli)

### Quando si usano?

* Per **personalizzare l’ambiente di esecuzione di Ansible**, aggiungere funzionalità cross-cutting.
* Quando vuoi modificare il comportamento di Ansible a livello di esecuzione, gestione output, o estendere la sintassi.

### Caratteristiche

* Integrati nel core Ansible.
* Più specifici rispetto ai moduli.
* Scritti in Python.
* Possono influenzare il modo in cui Ansible interpreta i playbook o interagisce con gli host.

### Esempio semplice di callback plugin

```python
# callback_plugins/simple_log.py

from ansible.plugins.callback import CallbackBase

class CallbackModule(CallbackBase):
    def v2_runner_on_ok(self, result):
        host = result._host.get_name()
        task = result.task_name
        print(f"TASK OK - {host}: {task}")
```

---

## 3. **Confronto diretto**

| Aspetto            | Moduli personalizzati                     | Plugin Ansible                                        |
| ------------------ | ----------------------------------------- | ----------------------------------------------------- |
| Scopo              | Eseguire task specifici                   | Estendere o modificare il comportamento di Ansible    |
| Invocazione        | Usati direttamente nei playbook come task | Interni ad Ansible, non task diretti                  |
| Tipi               | Script/programma standalone               | Callback, lookup, filter, connection, strategy, ecc.  |
| Livello di impatto | Esecuzione azioni sulle risorse           | Modifica runtime, output, connessione, template, ecc. |
| Idempotenza        | Necessaria                                | Non applicabile (dipende dal tipo)                    |
| Esempi             | Installare pacchetti, creare utenti       | Logger, filtri jinja, gestione connessioni            |
| Linguaggio         | Python (o altri)                          | Python                                                |

---

## 4. **Sintesi**

* Se vuoi **creare nuove azioni** (come installare un software, modificare configurazioni, chiamare API) → **moduli personalizzati**.
* Se vuoi **estendere il motore Ansible** (filtrare dati, personalizzare output, definire nuovi modi di connessione) → **plugin**.

---

Se vuoi, posso aiutarti a scrivere esempi più complessi per entrambi, o spiegarti come integrarli in un workflow dichiarativo Ansible. Vuoi procedere?


---
---

Perfetto! Procediamo con esempi e approfondimenti pratici su **moduli personalizzati** e **plugin Ansible**, per capire come realizzarli e integrarli nei tuoi playbook.

---

# 1. Moduli personalizzati: esempio completo e commentato

Supponiamo tu voglia creare un modulo che gestisca una “risorsa fittizia” chiamata `my_resource`, con parametri `name` e `state` (come nell’esempio base).

---

### File: `library/my_resource.py`

```python
#!/usr/bin/python

from ansible.module_utils.basic import AnsibleModule

def main():
    # Definizione degli argomenti accettati dal modulo
    module_args = dict(
        name=dict(type='str', required=True),
        state=dict(type='str', choices=['present', 'absent'], default='present')
    )

    module = AnsibleModule(
        argument_spec=module_args,
        supports_check_mode=True  # Supporta modalità "check"
    )

    name = module.params['name']
    state = module.params['state']

    # Simuliamo lo stato attuale (in un caso reale si farebbe controllo reale)
    current_state = 'absent'  # Supponiamo la risorsa non esista

    changed = False
    msg = ""

    if module.check_mode:
        # Modalità check: solo simulazione, non si cambia nulla
        module.exit_json(changed=(current_state != state), msg="Check mode: nessuna modifica eseguita")

    if state == 'present' and current_state != 'present':
        # Logica per creare la risorsa
        changed = True
        msg = f"Risorsa '{name}' creata"
    elif state == 'absent' and current_state != 'absent':
        # Logica per eliminare la risorsa
        changed = True
        msg = f"Risorsa '{name}' rimossa"
    else:
        msg = f"Risorsa '{name}' già nello stato desiderato ({state})"

    # Risposta di successo al motore Ansible
    module.exit_json(changed=changed, msg=msg)

if __name__ == '__main__':
    main()
```

---

### Come usare il modulo nel playbook:

```yaml
- hosts: localhost
  tasks:
    - name: Gestisci la risorsa fittizia
      my_resource:
        name: "esempio1"
        state: present
```

---

# 2. Plugin callback: esempio base di logging task

---

### File: `callback_plugins/simple_logger.py`

```python
from ansible.plugins.callback import CallbackBase

class CallbackModule(CallbackBase):
    """
    Plugin callback che stampa a video quando un task termina con successo.
    """

    CALLBACK_VERSION = 2.0
    CALLBACK_TYPE = 'notification'
    CALLBACK_NAME = 'simple_logger'

    def v2_runner_on_ok(self, result):
        host = result._host.get_name()
        task = result.task_name
        print(f"[INFO] TASK OK su {host}: {task}")
```

---

### Come usarlo:

* Posiziona il file nella cartella `callback_plugins/` del progetto.
* Esegui Ansible con il flag `-v` o imposta la variabile d’ambiente `ANSIBLE_CALLBACK_PLUGINS` per includere la cartella.
* Vedrai messaggi personalizzati per ogni task completato con successo.

---

# 3. Filter plugin: esempio di filtro personalizzato per manipolare stringhe

---

### File: `filter_plugins/my_filters.py`

```python
def shout(text):
    """
    Filtro che trasforma un testo in maiuscolo con esclamazioni.
    """
    return text.upper() + "!!!"

class FilterModule(object):
    def filters(self):
        return {
            'shout': shout
        }
```

---

### Esempio d’uso in un template Jinja2

```jinja
Messaggio: {{ "ciao mondo" | shout }}
# Risultato: CIAO MONDO!!!
```

---

# 4. Lookup plugin: esempio base per leggere dati da file esterno

---

### File: `lookup_plugins/my_lookup.py`

```python
from ansible.plugins.lookup import LookupBase

class LookupModule(LookupBase):

    def run(self, terms, variables=None, **kwargs):
        filename = terms[0]
        with open(filename, 'r') as f:
            content = f.read()
        return [content]
```

---

### Uso nel playbook

```yaml
- hosts: localhost
  tasks:
    - name: Usa lookup per leggere file
      debug:
        msg: "{{ lookup('my_lookup', 'file.txt') }}"
```

---

# 5. Connection plugin: esempio base (più avanzato, opzionale)

---

Definire un connection plugin è più complesso (gestione SSH, API, ecc.) e dipende dal caso d’uso specifico. Posso fornirti un esempio su richiesta.

---

# 6. Sintesi e suggerimenti

* **Moduli personalizzati**: usali per azioni, manipolazioni o interazioni con sistemi/risorse.
* **Plugin**: servono per estendere il funzionamento di Ansible (logging, filtri, lookup dati, connessioni personalizzate).
* Mantieni sempre il principio di **idempotenza** e **chiamata chiara** da playbook.
* Usa la struttura di directory standard (es. `library/`, `callback_plugins/`, `filter_plugins/`, `lookup_plugins/`) per facilitare l’organizzazione e il caricamento automatico.

---

Se vuoi, ti posso aiutare a costruire un mini progetto che integri moduli e plugin con esempi pratici, playbook e test. Vuoi procedere?


---
---


Perfetto! Procediamo con un mini progetto demo che integra:

* **Modulo personalizzato** (`library/my_resource.py`)
* **Plugin callback** (`callback_plugins/simple_logger.py`)
* **Plugin filtro** (`filter_plugins/my_filters.py`)
* **Plugin lookup** (`lookup_plugins/my_lookup.py`)

Includiamo inoltre:

* Un **playbook di esempio** che usa tutte queste estensioni
* Una breve **documentazione** inline
* Struttura directory standard

---

# Struttura progetto

```
ansible-declarative-demo/
├── library/
│   └── my_resource.py
├── callback_plugins/
│   └── simple_logger.py
├── filter_plugins/
│   └── my_filters.py
├── lookup_plugins/
│   └── my_lookup.py
├── playbook.yml
└── README.md
```

---

# 1. `library/my_resource.py`

```python
#!/usr/bin/python

from ansible.module_utils.basic import AnsibleModule

def main():
    module_args = dict(
        name=dict(type='str', required=True),
        state=dict(type='str', choices=['present', 'absent'], default='present')
    )

    module = AnsibleModule(
        argument_spec=module_args,
        supports_check_mode=True
    )

    name = module.params['name']
    state = module.params['state']

    current_state = 'absent'  # Simulazione: risorsa non esiste

    changed = False
    msg = ""

    if module.check_mode:
        module.exit_json(changed=(current_state != state), msg="Check mode: nessuna modifica eseguita")

    if state == 'present' and current_state != 'present':
        changed = True
        msg = f"Risorsa '{name}' creata"
    elif state == 'absent' and current_state != 'absent':
        changed = True
        msg = f"Risorsa '{name}' rimossa"
    else:
        msg = f"Risorsa '{name}' già nello stato desiderato ({state})"

    module.exit_json(changed=changed, msg=msg)

if __name__ == '__main__':
    main()
```

---

# 2. `callback_plugins/simple_logger.py`

```python
from ansible.plugins.callback import CallbackBase

class CallbackModule(CallbackBase):
    CALLBACK_VERSION = 2.0
    CALLBACK_TYPE = 'notification'
    CALLBACK_NAME = 'simple_logger'

    def v2_runner_on_ok(self, result):
        host = result._host.get_name()
        task = result.task_name
        print(f"[INFO] TASK OK su {host}: {task}")
```

---

# 3. `filter_plugins/my_filters.py`

```python
def shout(text):
    return text.upper() + "!!!"

class FilterModule(object):
    def filters(self):
        return {
            'shout': shout
        }
```

---

# 4. `lookup_plugins/my_lookup.py`

```python
from ansible.plugins.lookup import LookupBase

class LookupModule(LookupBase):
    def run(self, terms, variables=None, **kwargs):
        filename = terms[0]
        with open(filename, 'r') as f:
            content = f.read()
        return [content]
```

---

# 5. `playbook.yml`

```yaml
- hosts: localhost
  gather_facts: no

  vars:
    message: "ciao mondo"

  tasks:
    - name: Usa modulo personalizzato per creare risorsa
      my_resource:
        name: "demo_resource"
        state: present

    - name: Usa filtro personalizzato shout
      debug:
        msg: "{{ message | shout }}"

    - name: Usa lookup per leggere file demo.txt
      debug:
        msg: "{{ lookup('my_lookup', 'demo.txt') }}"
```

---

# 6. `README.md`

````markdown
# Ansible Declarative Demo

## Obiettivi

- Esempio pratico di estensioni Ansible: moduli personalizzati e plugin (callback, filter, lookup).
- Illustrare come ampliare Ansible per programmazione dichiarativa avanzata.
- Codice base per apprendere sviluppo e integrazione.

## Struttura

- `library/my_resource.py`: modulo personalizzato
- `callback_plugins/simple_logger.py`: plugin callback semplice
- `filter_plugins/my_filters.py`: filtro Jinja custom
- `lookup_plugins/my_lookup.py`: lookup plugin per leggere file esterni
- `playbook.yml`: playbook demo che usa tutte le estensioni

## Istruzioni

1. Posizionarsi nella directory del progetto
2. Preparare un file `demo.txt` con testo di esempio
3. Eseguire il playbook:

   ```bash
   ansible-playbook playbook.yml -v
````

4. Osservare output, log personalizzati e filtri applicati.

## Requisiti

* Ansible 2.9+
* Python 3.x
* Nessuna dipendenza esterna

## Note

* Per caricare plugin personalizzati, Ansible cerca nelle directory:

  * `library/` per moduli
  * `callback_plugins/` per callback
  * `filter_plugins/` per filtri
  * `lookup_plugins/` per lookup
* Mantieni questa struttura per il corretto caricamento.

```

---

Se vuoi posso aiutarti a creare una serie di esercizi e spiegazioni dettagliate sul funzionamento di ciascuno di questi componenti, oppure estendere con plugin connection o moduli più complessi.  
Fammi sapere!
```

---
---

Perfetto! Procediamo con una mini-guida didattica che ti accompagna passo-passo a capire e sperimentare con i vari plugin e moduli personalizzati Ansible.

---

# Guida didattica: Estendere Ansible con moduli e plugin personalizzati

---

## Capitolo 1: Introduzione al progetto e setup

### Obiettivo

Capire come creare e usare moduli, filtri, lookup e callback plugin in Ansible, partendo dal progetto demo che ti ho fornito.

### Passi

1. Clona o scarica il progetto con la struttura dati e codice già forniti.
2. Crea un file `demo.txt` con contenuto semplice, ad esempio:

```txt
Questo è un testo di esempio per il lookup plugin.
```

3. Esegui il playbook:

```bash
ansible-playbook playbook.yml -v
```

4. Osserva:

* Il modulo `my_resource` che simula la creazione di una risorsa.
* Il filtro `shout` che converte testo in maiuscolo con esclamazioni.
* Il lookup plugin che legge il contenuto di `demo.txt`.
* Il callback plugin che stampa log semplificati per ogni task riuscito.

---

## Capitolo 2: Moduli personalizzati

### Che cos’è un modulo personalizzato?

Un modulo Ansible è uno script (tipicamente Python) che esegue azioni specifiche, restituisce un JSON strutturato e viene invocato da un task.

### Come funziona `my_resource.py`?

* Riceve parametri `name` e `state`
* Simula la verifica dello stato corrente
* Decide se cambiare stato o no
* Gestisce la modalità check (`--check`)
* Restituisce risultato con messaggio e flag `changed`

### Esercizio

Modifica il modulo per accettare un parametro `description` opzionale e mostrarlo nel messaggio di output.

---

## Capitolo 3: Callback plugin

### Che cos’è un callback plugin?

Permette di intercettare eventi durante l’esecuzione Ansible, per personalizzare log, notifiche, statistiche.

### Come funziona `simple_logger.py`?

Stampa una linea info ogni volta che un task è completato con successo (`runner_on_ok`).

### Esercizio

Aggiungi la gestione di task falliti (`runner_on_failed`) per stampare un messaggio d’errore.

---

## Capitolo 4: Filter plugin

### Che cos’è un filtro Jinja?

Una funzione applicata a variabili dentro template per trasformare il contenuto.

### Come funziona `my_filters.py`?

Definisce un filtro `shout` che trasforma una stringa in maiuscolo con punti esclamativi.

### Esercizio

Implementa un filtro `repeat` che prende due argomenti: una stringa e un numero, e restituisce la stringa ripetuta n volte.

---

## Capitolo 5: Lookup plugin

### Che cos’è un lookup plugin?

Serve a recuperare dati da fonti esterne (file, database, API) durante la valutazione di una variabile.

### Come funziona `my_lookup.py`?

Legge e restituisce il contenuto di un file di testo.

### Esercizio

Modifica il plugin per accettare anche un secondo parametro opzionale `lines` che limita il numero di righe restituite.

---

## Capitolo 6: Integrazione e test

### Obiettivo

Sperimenta combinando i plugin e il modulo nel playbook.

* Usa il filtro `shout` con il testo letto dal lookup.
* Esegui il modulo in modalità check.
* Osserva i messaggi prodotti dal callback plugin.

---

## Capitolo 7: Esercizi avanzati

### Esercizio 1

Crea un modulo personalizzato che gestisca la creazione di file temporanei con contenuti dinamici.

### Esercizio 2

Sviluppa un callback plugin che registra eventi in un file di log JSON strutturato.

### Esercizio 3

Costruisci un filtro che formatta date in formati ISO o personalizzati.

### Esercizio 4

Implementa un lookup plugin che interroga un’API REST e restituisce dati.

---

Se vuoi, posso procedere a scrivere i contenuti dettagliati di ogni capitolo, includendo snippet di codice, spiegazioni passo-passo e soluzioni agli esercizi.

Dimmi come preferisci!


---
---


---
---


---
---


---
---


---
---


---
---


---
---