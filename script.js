document.addEventListener("DOMContentLoaded", () => {
 const zitate = [
  "Geld allein macht nicht glücklich. Es gehören auch noch Aktien, Gold und Immobilien dazu. – Danny Kaye",
  "Spare in der Zeit, dann hast du in der Not.",
  "Der Zinseszins ist das achte Weltwunder. – Albert Einstein",
  "Nicht das Einkommen bestimmt den Wohlstand, sondern die Ausgaben. – Thomas Fuller",
  "Ein Budget ist der Versuch, mit dem Geld auszukommen, ohne sich mit dem Finanzamt anlegen zu müssen.",
  "Reich ist, wer mehr Träume in seiner Seele hat als Geld in der Tasche.",
  "Der sicherste Weg zum Reichtum ist, weniger auszugeben als man verdient.",
  "Je mehr du lernst, desto mehr verdienst du. – Warren Buffett",
  "Ein Investment in Wissen bringt immer noch die besten Zinsen. – Benjamin Franklin",
  "Sparen ist eine sehr gute Einnahme. – Cicero",
  "Der Unterschied zwischen arm und reich ist oft Disziplin.",
  "Wer den Pfennig nicht ehrt, ist des Talers nicht wert.",
  "Reichtum beginnt im Kopf, nicht im Portemonnaie.",
  "Es ist nicht wichtig, wie viel du verdienst, sondern was du behältst.",
  "Investieren ist nicht spekulieren. – André Kostolany",
  "Finanzielle Freiheit ist kein Ziel – sie ist ein Lebensstil.",
  "Wenn du keine Ziele hast, bist du Teil der Ziele anderer. – Tony Robbins",
  "Verdiene Geld im Schlaf – das ist wahre Freiheit.",
  "Gib jedem Dollar einen Job – sonst macht er sich selbstständig.",
  "Schulden machen Sklaven aus freien Menschen.",
  "Mach dein Geld zu deinem Angestellten.",
  "Gib nicht mehr aus, nur weil du mehr verdienst.",
  "Finanzielle Bildung ist wichtiger als finanzieller Erfolg.",
  "Hinter jedem erfolgreichen Investor steht eine kluge Entscheidung.",
  "Reich wirst du nicht durch das, was du verdienst – sondern durch das, was du behältst.",
  "Die meisten Menschen arbeiten hart für ihr Geld, aber nur wenige lassen ihr Geld für sich arbeiten.",
  "Eine Investition in sich selbst zahlt die höchsten Dividenden.",
  "Die besten Dinge im Leben sind kostenlos – die zweitbesten sind teuer.",
  "Es ist nicht das Ziel, reich zu sterben, sondern frei zu leben.",
  "Dein Geld sollte einen Plan haben, nicht nur Hoffnung.",
  "Zeit ist Geld – aber Geld kann dir Zeit kaufen.",
  "Geld folgt dem Fokus – nicht umgekehrt.",
  "Reich wirst du, wenn du Geld verdienst, während du schläfst.",
  "Die Kontrolle über dein Geld ist Kontrolle über dein Leben.",
  "Geld verdirbt nicht den Charakter – es zeigt ihn.",
  "Sparen ist keine Einschränkung, sondern ein Werkzeug.",
  "Nicht der Reiche ist glücklich, sondern der Zufriedene.",
  "Erfolg im Leben besteht darin, mit dem Geld auszukommen, das man hat.",
  "Reich ist, wer wenig braucht.",
  "Verschiebe nicht das Sparen auf morgen – dein Zukunfts-Ich wird es dir danken.",
  "Ein Budget ist ein Werkzeug zur Freiheit, nicht zur Einschränkung.",
  "Ein Auto macht dich nicht reich – es zeigt nur, wofür du dein Geld ausgibst.",
  "Jeder Euro zählt – vor allem beim Zinseszins.",
  "Manche kaufen Dinge, die sie nicht brauchen, um Leute zu beeindrucken, die sie nicht mögen.",
  "Finanzielle Unabhängigkeit beginnt mit einem Plan.",
  "Sparen ist die Fähigkeit, heute auf etwas zu verzichten, um morgen mehr zu haben.",
  "Geld ist ein schlechter Meister, aber ein guter Diener.",
  "Erkenne den Unterschied zwischen Vermögenswert und Verbindlichkeit. – Robert Kiyosaki",
  "Wohlstand bedeutet, dass dein Geld für dich arbeitet.",
  "Investieren ist ein Marathon, kein Sprint.",
  "Zeit + Geld + Zinsen = Vermögen.",
  "Finanzielle Freiheit bedeutet, Entscheidungen ohne Geldsorgen treffen zu können.",
  "Jede große Reise beginnt mit einem kleinen gesparten Euro.",
  "Wachstum beginnt dort, wo deine Komfortzone endet – auch finanziell.",
  "Ein Notgroschen ist keine Option – er ist Pflicht.",
  "Reich ist nicht, wer viel hat, sondern wer wenig braucht.",
  "Stell dein Geld in den Dienst deiner Werte.",
  "Passives Einkommen ist aktives Denken.",
  "Ein Euro heute ist mehr wert als ein Euro morgen.",
  "Konsumschulden sind die Fußfesseln der Freiheit.",
  "Mit Geduld wird auch aus Cent ein Vermögen.",
  "Die wichtigste finanzielle Entscheidung: heute anfangen.",
  "Ein Kauf auf Kredit ist ein Diebstahl an deinem zukünftigen Ich.",
  "Deine Finanzen spiegeln deine Prioritäten.",
  "Gib deinem Geld Richtung, bevor es sich verläuft.",
  "Freiheit beginnt, wenn du aufhörst, für Statussymbole zu leben.",
  "Ein erfolgreicher Investor ist geduldig und vorbereitet.",
  "Warte nicht auf den perfekten Moment – investiere regelmäßig.",
  "Jeder gesparte Euro ist ein Euro, den du nicht mehr verdienen musst.",
  "Es ist leichter, Reichtum zu bewahren, als ihn zu verdienen.",
  "Verzichte auf wenig heute, um morgen viel zu gewinnen.",
  "Dein Geld kann dein bester Mitarbeiter sein – wenn du es richtig einsetzt.",
  "Finanzieller Erfolg ist eine Frage der Gewohnheit, nicht des Einkommens.",
  "Lass dich nicht von der Werbung reich machen – mach dich selbst reich.",
  "Je höher dein Konsum, desto teurer dein Leben.",
  "Ohne Überblick über dein Geld, verlierst du die Kontrolle.",
  "Der erste Schritt zur finanziellen Freiheit ist Ehrlichkeit mit sich selbst.",
  "Kauf nicht, nur weil es im Angebot ist.",
  "Finanzen brauchen Klarheit, nicht Komplexität.",
  "Wirklich reiche Menschen reden selten über Geld.",
  "Investiere in Dinge, die im Wert steigen – nicht in die, die blinken.",
  "Sparquote schlägt Gehalt.",
  "Wissen ist das neue Kapital.",
  "Deine Finanzen – deine Verantwortung.",
  "Du kannst alles haben – nur nicht gleichzeitig.",
  "Das Ziel ist nicht Millionen zu haben, sondern Millionär zu werden (im Denken).",
  "Sparsamkeit ist die Schwester der Freiheit.",
  "Du brauchst keine Millionen – nur genug, um dich frei zu fühlen.",
  "Konsumiere bewusst – investiere absichtlich.",
  "Langfristigkeit ist der Zinseszins des Denkens.",
  "Weniger Zeug = mehr Geld = mehr Freiheit.",
  "Finanzielle Unabhängigkeit beginnt im Kopf.",
  "Du arbeitest für Geld – oder es arbeitet für dich.",
  "Das größte Vermögen ist ein ruhiger Schlaf.",
  "Finanzen sind wie Pflanzen – sie wachsen mit Geduld und Pflege.",
  "Glück ist unbezahlbar – aber gute Planung kostet nichts.",
  "Echte Freiheit bedeutet, Nein sagen zu können – auch beim Geld.",
  "Nicht die Höhe deines Einkommens bestimmt dein Glück, sondern deine Einstellung dazu.",
  "Geld ist ein Werkzeug – nicht das Ziel.",
  "Es ist einfacher, mehr aus weniger zu machen, als mehr zu brauchen.",
  "Frugalität ist kein Verzicht, sondern Weitsicht.",
  "Reichtum ist relativ – Freiheit ist absolut.",
  "Ein solides Fundament besteht aus kleinen Entscheidungen – Tag für Tag."
];
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

const zitatContainer = document.getElementById("zitat-des-tages");
  if (zitatContainer) {
    const zufall = Math.floor(Math.random() * zitate.length);
    zitatContainer.textContent = `💬 „${zitate[zufall]}“`;
  }
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
        row.innerHTML = `
          <td>${v.name}</td>
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
