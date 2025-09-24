document.addEventListener("DOMContentLoaded", () => {
 const zitate = [
  "Der einzige Weg, großartige Arbeit zu leisten, ist zu lieben, was man tut. – Steve Jobs",
  "Phantasie ist wichtiger als Wissen, denn Wissen ist begrenzt. – Albert Einstein",
  "Der Mensch ist frei geboren, und überall liegt er in Ketten. – Jean-Jacques Rousseau",
  "Nicht wer wenig hat, sondern wer viel wünscht, ist arm. – Seneca",
  "Wer kämpft, kann verlieren. Wer nicht kämpft, hat schon verloren. – Bertolt Brecht",
  "In der Mitte von Schwierigkeiten liegen die Möglichkeiten. – Albert Einstein",
  "Der Langsamste, der sein Ziel nicht aus den Augen verliert, geht immer noch schneller als der, der ohne Ziel herumirrt. – Gotthold Ephraim Lessing",
  "Es ist nicht genug, zu wissen, man muss auch anwenden; es ist nicht genug, zu wollen, man muss auch tun. – Johann Wolfgang von Goethe",
  "Mut steht am Anfang des Handelns, Glück am Ende. – Demokrit",
  "Die beste Zeit, einen Baum zu pflanzen, war vor zwanzig Jahren. Die zweitbeste Zeit ist jetzt. – Chinesisches Sprichwort",
  "Alles, was du dir vorstellen kannst, ist real. – Pablo Picasso",
  "Wer die Vergangenheit nicht kennt, kann die Zukunft nicht verstehen. – Helmut Kohl",
  "Der Weg ist das Ziel. – Konfuzius",
  "In einem freien Staat dürfen Zungen wie die Gedanken frei sein. – Euripides",
  "Nicht die Jahre in unserem Leben zählen, sondern das Leben in unseren Jahren. – Adlai E. Stevenson",
  "Wer immer tut, was er schon kann, bleibt immer das, was er schon ist. – Henry Ford",
  "Der Frühaufsteher bekommt den Wurm, aber die zweite Maus den Käse. – Norm Sprenger",
  "Wer anderen eine Grube gräbt, fällt selbst hinein. – Sprichwort",
  "Was wir wissen, ist ein Tropfen; was wir nicht wissen, ein Ozean. – Isaac Newton",
  "Die Grenzen deiner Sprache sind die Grenzen deiner Welt. – Ludwig Wittgenstein"
 ];

const zitatContainer = document.getElementById("zitat-des-tages");
if (zitatContainer) {
  const zufall = Math.floor(Math.random() * zitate.length);
  zitatContainer.textContent = `💬 „${zitate[zufall]}“`;
}

const nutzerDropdown = document.getElementById("nutzer");
const neuerNutzerInput = document.getElementById("neuerNutzer");
const btnAddUser = document.getElementById("btn-add-user");
const btnDeleteUser = document.getElementById("btn-delete-user");

// IndexedDB für Vertragsdaten initialisieren
let db;
const idbRequest = indexedDB.open("VertraegeDB", 1);

idbRequest.onupgradeneeded = function (event) {
  db = event.target.result;
  if (!db.objectStoreNames.contains("vertraege")) {
    const store = db.createObjectStore("vertraege", { keyPath: "id", autoIncrement: true });
    store.createIndex("nutzer", "nutzer", { unique: false });
  }
};

idbRequest.onsuccess = function (event) {
  db = event.target.result;
  if (document.querySelector("#vertraegeListe")) {
    ladeVertraege();
  }
};

idbRequest.onerror = function () {
  console.error("IndexedDB konnte nicht geöffnet werden");
};

let nutzerListe = JSON.parse(localStorage.getItem("nutzerListe")) || ["Philipp", "Franni", "Klopsmann"];

function aktualisiereNutzerDropdown() {
  nutzerDropdown.innerHTML = '<option value="">-- bitte wählen --</option>';
  nutzerListe.forEach(n => {
    const opt = document.createElement("option");
    opt.value = n;
    opt.textContent = n;
    nutzerDropdown.appendChild(opt);
  });
}

aktualisiereNutzerDropdown();

btnAddUser.addEventListener("click", () => {
  const name = neuerNutzerInput.value.trim();
  if (!name || nutzerListe.includes(name)) return;
  nutzerListe.push(name);
  localStorage.setItem("nutzerListe", JSON.stringify(nutzerListe));
  neuerNutzerInput.value = "";
  aktualisiereNutzerDropdown();
});

nutzerDropdown.addEventListener("change", () => {
  btnDeleteUser.disabled = !nutzerDropdown.value;
  btnDeleteUser.textContent = nutzerDropdown.value
    ? `🗑️ Benutzer „${nutzerDropdown.value}“ löschen`
    : "🗑️ Benutzer löschen";
});

btnDeleteUser.addEventListener("click", async () => {
  const user = nutzerDropdown.value;
  if (!user) return;
  if (!confirm(`Benutzer „${user}“ und alle zugehörigen Verträge löschen?`)) {
    return;
  }

  nutzerListe = nutzerListe.filter((n) => n !== user);
  localStorage.setItem("nutzerListe", JSON.stringify(nutzerListe));

  try {
    const tx = db.transaction("vertraege", "readwrite");
    const store = tx.objectStore("vertraege");
    const index = store.index("nutzer");
    index.openCursor(IDBKeyRange.only(user)).onsuccess = function (e) {
      const cursor = e.target.result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      }
    };
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error("Fehler beim Löschen des Nutzers:", err);
  }

  if (localStorage.getItem("nutzer") === user) {
    localStorage.removeItem("nutzer");
  }

  aktualisiereNutzerDropdown();
  nutzerDropdown.value = "";
  btnDeleteUser.disabled = true;
  btnDeleteUser.textContent = "🗑️ Benutzer löschen";
  ladeVertraege();
});

const form = document.querySelector("form");
  const nutzerInput = document.querySelector("#nutzer");
  const nameInput = document.querySelector("#name");
  const kostenInput = document.querySelector("#kosten");
  const intervallInput = document.querySelector("#intervall");
  const startdatumInput = document.querySelector("#startdatum");
  const laufzeitInput = document.querySelector("#laufzeit");
  const liste = document.querySelector("#liste");
  const summenbereich = document.querySelector("#summenbereich");
  const speichernButton = form.querySelector("button[type='submit']");

  let editModus = false;
  let editID = null;
  let aktuelleSortierung = { spalte: "name", richtung: "asc" };

  // Immer mobile-mode aktiv, keine Umschaltlogik
  document.body.classList.add("mobile-mode");

  const gespeicherterNutzer = localStorage.getItem("nutzer");
  if (gespeicherterNutzer) {
    nutzerInput.value = gespeicherterNutzer;
  }

  nutzerInput.addEventListener("change", () => {
    localStorage.setItem("nutzer", nutzerInput.value);
    ladeVertraege();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nutzer = nutzerInput.value.trim();
    const name = nameInput.value.trim();
    const kosten = parseFloat(kostenInput.value);
    const intervall = intervallInput.value;
    const startdatum = startdatumInput.value.trim();
    const laufzeit = laufzeitInput.value;

    if (!nutzer || !name || isNaN(kosten)) {
      alert("Bitte gültige Vertragsdaten eingeben.");
      return;
    }

    let ablaufdatum = "-";
    const datumParts = startdatum.split(".");
    if (datumParts.length === 3 && (laufzeit === "12" || laufzeit === "24")) {
      const tag = parseInt(datumParts[0]);
      const monat = parseInt(datumParts[1]) - 1;
      const jahr = parseInt("20" + datumParts[2]);
      const start = new Date(jahr, monat, tag);
      start.setMonth(start.getMonth() + parseInt(laufzeit));

      const tagStr = String(start.getDate()).padStart(2, "0");
      const monatStr = String(start.getMonth() + 1).padStart(2, "0");
      const jahrStr = String(start.getFullYear()).slice(-2);
      ablaufdatum = `${tagStr}.${monatStr}.${jahrStr}`;
    }

    const vertrag = {
      nutzer,
      name,
      kosten,
      intervall,
      startdatum,
      laufzeit,
      ablaufdatum,
      erstelltAm: new Date().toISOString(),
    };

    try {
      const tx = db.transaction("vertraege", "readwrite");
      const store = tx.objectStore("vertraege");
      if (editModus && editID) {
        store.put({ ...vertrag, id: editID });
      } else {
        store.add(vertrag);
      }
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      form.reset();
      speichernButton.textContent = "✚ Hinzufügen";
      editModus = false;
      editID = null;
      nutzerInput.value = nutzer;
      ladeVertraege();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      alert("Speichern fehlgeschlagen.");
    }
  });

  async function ladeVertraege() {
    liste.innerHTML = "";
    summenbereich.innerHTML = "";
    const nutzer = nutzerInput.value.trim();
    if (!nutzer) return;

    let summeMonatlich = 0;
    let summeHalbjaehrlich = 0;
    let summeJaehrlich = 0;

    try {
      const tx = db.transaction("vertraege", "readonly");
      const store = tx.objectStore("vertraege");
      const index = store.index("nutzer");
      const vertraege = await new Promise((resolve, reject) => {
        const req = index.getAll(IDBKeyRange.only(nutzer));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      if (!vertraege.length) return;

      vertraege.sort((a, b) => {
        const feld = aktuelleSortierung.spalte;
        let valA = a[feld];
        let valB = b[feld];
        if (feld === "kosten") {
          valA = parseFloat(valA);
          valB = parseFloat(valB);
        } else {
          valA = (valA || "").toString().toLowerCase();
          valB = (valB || "").toString().toLowerCase();
        }
        const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
        return aktuelleSortierung.richtung === "asc" ? cmp : -cmp;
      });

      const table = document.createElement("table");
      table.className = "vertraege";
      const sortPfeil = (feld) =>
        aktuelleSortierung.spalte === feld
          ? aktuelleSortierung.richtung === "asc"
            ? " ▲"
            : " ▼"
          : "";
      table.innerHTML = `
        <thead><tr>
          <th data-sort="name">Name${sortPfeil("name")}</th>
          <th data-sort="kosten">Kosten${sortPfeil("kosten")}</th>
          <th data-sort="intervall">Intervall${sortPfeil("intervall")}</th>
          <th data-sort="ablaufdatum">Ende${sortPfeil("ablaufdatum")}</th>
          <th></th>
        </tr></thead>
        <tbody></tbody>
      `;
      const tbody = table.querySelector("tbody");
      table.querySelectorAll("th[data-sort]").forEach((th) => {
        th.style.cursor = "pointer";
        th.addEventListener("click", () => {
          const feld = th.dataset.sort;
          if (aktuelleSortierung.spalte === feld) {
            aktuelleSortierung.richtung =
              aktuelleSortierung.richtung === "asc" ? "desc" : "asc";
          } else {
            aktuelleSortierung = { spalte: feld, richtung: "asc" };
          }
          ladeVertraege();
        });
      });

      let rowIndex = 0;
      vertraege.forEach((v) => {
        if (v.intervall === "monatlich") summeMonatlich += parseFloat(v.kosten);
        else if (v.intervall === "halbjährlich") summeHalbjaehrlich += parseFloat(v.kosten);
        else if (v.intervall === "jährlich") summeJaehrlich += parseFloat(v.kosten);

        const row = document.createElement("tr");
        row.classList.add(rowIndex % 2 === 0 ? "row-even" : "row-odd");
        rowIndex++;

        let highlight = false;
        if ((v.laufzeit === "12" || v.laufzeit === "24") && v.ablaufdatum) {
          const parts = v.ablaufdatum.split(".");
          if (parts.length === 3) {
            const d = parseInt(parts[0]);
            const m = parseInt(parts[1]) - 1;
            const y = parseInt("20" + parts[2]);
            const endDate = new Date(y, m, d);
            const diffDays = (endDate - new Date()) / (1000 * 60 * 60 * 24);
            if (diffDays >= 0 && diffDays <= 90) highlight = true;
          }
        }

        const nameDisplay = highlight ? `❗ ${v.name}` : v.name;

        row.style.color = highlight ? "red" : "";
        row.innerHTML = `
          <td>${nameDisplay}</td>
          <td>${v.kosten.toFixed(2)} €</td>
          <td>${v.intervall}</td>
          <td>${v.ablaufdatum || "-"}</td>
          <td style="padding: 0;">
            <div style="display: flex; gap: 0.4em; align-items: center;">
              <button class="btn-bearbeiten" data-id="${v.id}" style="font-size:18px; background:none; border:none; padding:0; margin:0; line-height:1; cursor:pointer;">✏️</button>
              <button class="btn-loeschen" data-id="${v.id}" style="font-size:18px; background:none; border:none; padding:0; margin:0; line-height:1; cursor:pointer;">🗑️</button>
            </div>
          </td>
        `;
        tbody.appendChild(row);

        const detail = document.createElement("tr");
        detail.style.display = "none";
        detail.innerHTML = `
          <td colspan="5" style="font-size: 0.9em; color: #444;">
            Start: ${v.startdatum || "-"}<br>
            Laufzeit: ${v.laufzeit || "-"}<br>
            ${
              v.startdatum && v.laufzeit !== "monatlich"
                ? `Aktuelle Periode: ${berechnePeriode(v.startdatum, v.laufzeit)}`
                : ""
            }
          </td>
        `;
        tbody.appendChild(detail);

        row.addEventListener("click", () => {
          if (detail) {
            detail.style.display =
              detail.style.display === "none" ? "table-row" : "none";
          }
        });

        row.querySelector(".btn-loeschen").addEventListener("click", async (e) => {
          e.stopPropagation();
          const id = parseInt(e.target.getAttribute("data-id"));
          const txDel = db.transaction("vertraege", "readwrite");
          txDel.objectStore("vertraege").delete(id);
          await new Promise((resolve, reject) => {
            txDel.oncomplete = resolve;
            txDel.onerror = () => reject(txDel.error);
          });
          ladeVertraege();
        });

        row.querySelector(".btn-bearbeiten").addEventListener("click", (e) => {
          e.stopPropagation();
          editModus = true;
          editID = v.id;
          nameInput.value = v.name;
          kostenInput.value = v.kosten;
          intervallInput.value = v.intervall;
          startdatumInput.value = v.startdatum;
          laufzeitInput.value = v.laufzeit;
          speichernButton.textContent = "💾 Speichern";
        });
      });

      liste.appendChild(table);

      summenbereich.innerHTML = `
        <br><br>
        <table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr><th colspan="2">Gesamtkosten</th></tr>
          </thead>
          <tbody>
            <tr><td>monatlich</td><td>${summeMonatlich.toFixed(2)} €</td></tr>
            <tr><td>halbjährlich</td><td>${summeHalbjaehrlich.toFixed(2)} €</td></tr>
            <tr><td>jährlich</td><td>${summeJaehrlich.toFixed(2)} €</td></tr>
          </tbody>
        </table>
      `;
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    }
  }

  function berechnePeriode(startdatum, laufzeit) {
    const parts = startdatum.split(".");
    if (parts.length !== 3) return "-";
    const tag = parseInt(parts[0]);
    const monat = parseInt(parts[1]) - 1;
    const jahr = parseInt("20" + parts[2]);
    const start = new Date(jahr, monat, tag);
    const now = new Date();

    while (start < now) {
      start.setMonth(start.getMonth() + parseInt(laufzeit));
    }

    const ende = new Date(start);
    ende.setMonth(ende.getMonth() + parseInt(laufzeit));

    const format = (d) =>
      `${String(d.getDate()).padStart(2, "0")}.${String(
        d.getMonth() + 1
      ).padStart(2, "0")}.${String(d.getFullYear()).slice(-2)}`;

    return `${format(start)} – ${format(ende)}`;
  }

  // ladeVertraege wird nach erfolgreichem Öffnen der Datenbank aufgerufen
});
