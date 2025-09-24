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

const API_BASE_URL = (window.API_BASE_URL || "").replace(/\/$/, "");
const apiUrl = (path) => `${API_BASE_URL}${path}`;

let nutzerListe = [];

function findeNutzerNameById(id) {
  const eintrag = nutzerListe.find((n) => String(n.id) === String(id));
  return eintrag ? eintrag.username : "";
}

function aktualisiereNutzerDropdown(gespeicherteId = null) {
  if (!nutzerDropdown) return;
  nutzerDropdown.innerHTML = '<option value="">-- bitte wählen --</option>';
  nutzerListe.forEach((nutzer) => {
    const opt = document.createElement("option");
    opt.value = String(nutzer.id);
    opt.textContent = nutzer.username;
    nutzerDropdown.appendChild(opt);
  });

  if (gespeicherteId && nutzerListe.some((n) => String(n.id) === String(gespeicherteId))) {
    nutzerDropdown.value = String(gespeicherteId);
  }

  const aktuelleId = nutzerDropdown.value;
  if (btnDeleteUser) {
    btnDeleteUser.disabled = !aktuelleId;
    btnDeleteUser.textContent = aktuelleId
      ? `🗑️ Benutzer „${findeNutzerNameById(aktuelleId)}“ löschen`
      : "🗑️ Benutzer löschen";
  }
}

async function ladeNutzer() {
  if (!nutzerDropdown) return;
  try {
    const response = await fetch(apiUrl("/api/users"));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    nutzerListe = await response.json();
  } catch (error) {
    console.error("Benutzer konnten nicht geladen werden:", error);
    nutzerListe = [];
  }

  const gespeicherteId = localStorage.getItem("nutzerId");
  aktualisiereNutzerDropdown(gespeicherteId);

  if (nutzerDropdown.value) {
    ladeVertraege();
  } else {
    const gespeicherterName = localStorage.getItem("nutzer");
    if (gespeicherterName) {
      const eintrag = nutzerListe.find((n) => n.username === gespeicherterName);
      if (eintrag) {
        nutzerDropdown.value = String(eintrag.id);
        localStorage.setItem("nutzerId", String(eintrag.id));
        ladeVertraege();
      }
    }
  }
}

if (btnAddUser) {
  btnAddUser.addEventListener("click", async () => {
    const name = (neuerNutzerInput?.value || "").trim();
    if (!name) return;

    try {
      const response = await fetch(apiUrl("/api/users"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name }),
      });

      if (response.status === 409) {
        alert("Benutzer existiert bereits.");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const neuerNutzer = await response.json();
      neuerNutzerInput.value = "";
      await ladeNutzer();
      nutzerDropdown.value = String(neuerNutzer.id);
      localStorage.setItem("nutzerId", String(neuerNutzer.id));
      localStorage.setItem("nutzer", neuerNutzer.username);
      if (btnDeleteUser) {
        btnDeleteUser.disabled = false;
        btnDeleteUser.textContent = `🗑️ Benutzer „${neuerNutzer.username}“ löschen`;
      }
      ladeVertraege();
    } catch (error) {
      console.error("Benutzer konnte nicht angelegt werden:", error);
      alert("Benutzer konnte nicht angelegt werden.");
    }
  });
}

if (nutzerDropdown) {
  nutzerDropdown.addEventListener("change", () => {
    const ausgewaehlteId = nutzerDropdown.value;
    const name = findeNutzerNameById(ausgewaehlteId);
    if (ausgewaehlteId) {
      localStorage.setItem("nutzerId", ausgewaehlteId);
      if (name) {
        localStorage.setItem("nutzer", name);
      }
    }
    if (btnDeleteUser) {
      btnDeleteUser.disabled = !ausgewaehlteId;
      btnDeleteUser.textContent = ausgewaehlteId
        ? `🗑️ Benutzer „${name}“ löschen`
        : "🗑️ Benutzer löschen";
    }
    ladeVertraege();
  });
}

if (btnDeleteUser) {
  btnDeleteUser.addEventListener("click", async () => {
    const ausgewaehlteId = nutzerDropdown?.value;
    if (!ausgewaehlteId) return;
    const name = findeNutzerNameById(ausgewaehlteId);
    if (!confirm(`Benutzer „${name || ausgewaehlteId}“ und alle zugehörigen Verträge löschen?`)) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/users/${ausgewaehlteId}`), { method: "DELETE" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      if (localStorage.getItem("nutzerId") === ausgewaehlteId) {
        localStorage.removeItem("nutzerId");
      }
      if (localStorage.getItem("nutzer") === name) {
        localStorage.removeItem("nutzer");
      }
      await ladeNutzer();
      nutzerDropdown.value = "";
      btnDeleteUser.disabled = true;
      btnDeleteUser.textContent = "🗑️ Benutzer löschen";
      if (liste) liste.innerHTML = "";
      if (summenbereich) summenbereich.innerHTML = "";
    } catch (error) {
      console.error("Benutzer konnte nicht gelöscht werden:", error);
      alert("Benutzer konnte nicht gelöscht werden.");
    }
  });
}

const form = document.querySelector("form");
const nameInput = document.querySelector("#name");
const kostenInput = document.querySelector("#kosten");
const intervallInput = document.querySelector("#intervall");
const startdatumInput = document.querySelector("#startdatum");
const laufzeitInput = document.querySelector("#laufzeit");
const liste = document.querySelector("#liste");
const summenbereich = document.querySelector("#summenbereich");
const speichernButton = form?.querySelector("button[type='submit']");

let editModus = false;
let editID = null;
let aktuelleSortierung = { spalte: "name", richtung: "asc" };

function parseInputDate(value) {
  if (!value) return null;
  const parts = value.split(".").map((p) => p.trim());
  if (parts.length !== 3) return null;
  const [tagStr, monatStr, jahrStr] = parts;
  const tag = parseInt(tagStr, 10);
  const monat = parseInt(monatStr, 10);
  let jahr = jahrStr.length === 2 ? 2000 + parseInt(jahrStr, 10) : parseInt(jahrStr, 10);
  if (!tag || !monat || !jahr || monat < 1 || monat > 12 || tag < 1 || tag > 31) return null;
  return `${jahr.toString().padStart(4, "0")}-${String(monat).padStart(2, "0")}-${String(tag).padStart(2, "0")}`;
}

function formatDateForDisplay(isoDate) {
  if (!isoDate) return "";
  const [jahr, monat, tag] = isoDate.split("T")[0].split("-");
  if (!jahr || !monat || !tag) return "";
  return `${tag.padStart(2, "0")}.${monat.padStart(2, "0")}.${jahr.slice(-2)}`;
}

function parseISOToDate(isoDate) {
  if (!isoDate) return null;
  const [jahrStr, monatStr, tagStr] = isoDate.split("T")[0].split("-");
  const jahr = parseInt(jahrStr, 10);
  const monat = parseInt(monatStr, 10) - 1;
  const tag = parseInt(tagStr, 10);
  if (Number.isNaN(jahr) || Number.isNaN(monat) || Number.isNaN(tag)) return null;
  return new Date(jahr, monat, tag);
}

function addMonths(date, months) {
  const result = new Date(date.getTime());
  const targetMonth = result.getMonth() + months;
  result.setMonth(targetMonth);
  return result;
}

function berechneAblaufIso(startIso, laufzeit) {
  const monate = parseInt(laufzeit, 10);
  if (!startIso || Number.isNaN(monate)) return null;
  const start = parseISOToDate(startIso);
  if (!start) return null;
  const ende = addMonths(start, monate);
  return `${ende.getFullYear()}-${String(ende.getMonth() + 1).padStart(2, "0")}-${String(ende.getDate()).padStart(2, "0")}`;
}

function berechnePeriode(startIso, laufzeit) {
  const monate = parseInt(laufzeit, 10);
  if (!startIso || Number.isNaN(monate)) return "-";
  const start = parseISOToDate(startIso);
  if (!start) return "-";
  const now = new Date();
  while (start < now) {
    start.setMonth(start.getMonth() + monate);
  }
  const ende = addMonths(start, monate);
  return `${formatDateForDisplay(`${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`)} – ${formatDateForDisplay(`${ende.getFullYear()}-${String(ende.getMonth() + 1).padStart(2, "0")}-${String(ende.getDate()).padStart(2, "0")}`)}`;
}

document.body.classList.add("mobile-mode");

async function ladeVertraege() {
  if (!liste || !summenbereich || !nutzerDropdown) return;
  liste.innerHTML = "";
  summenbereich.innerHTML = "";

  const nutzerId = nutzerDropdown.value;
  if (!nutzerId) return;

  let summeMonatlich = 0;
  let summeHalbjaehrlich = 0;
  let summeJaehrlich = 0;

  try {
    const response = await fetch(apiUrl(`/api/contracts?user_id=${encodeURIComponent(nutzerId)}`));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const daten = await response.json();
    if (!Array.isArray(daten) || daten.length === 0) {
      return;
    }

    const vertraege = daten.map((vertrag) => {
      const laufzeit = vertrag.term || "monatlich";
      const startIso = vertrag.start_date || null;
      const ablaufIso = laufzeit !== "monatlich" ? berechneAblaufIso(startIso, laufzeit) : null;
      return {
        id: vertrag.id,
        name: vertrag.name,
        kosten: Number(vertrag.cost) || 0,
        intervall: vertrag.interval,
        laufzeit,
        startIso,
        startAnzeige: formatDateForDisplay(startIso),
        ablaufIso,
        ablaufAnzeige: formatDateForDisplay(ablaufIso),
      };
    });

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
        <th data-sort="ablaufIso">Ende${sortPfeil("ablaufIso")}</th>
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
          aktuelleSortierung.richtung = aktuelleSortierung.richtung === "asc" ? "desc" : "asc";
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
      if ((v.laufzeit === "12" || v.laufzeit === "24") && v.ablaufIso) {
        const endDate = parseISOToDate(v.ablaufIso);
        if (endDate) {
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
        <td>${v.ablaufAnzeige || "-"}</td>
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
          Start: ${v.startAnzeige || "-"}<br>
          Laufzeit: ${v.laufzeit || "-"}<br>
          ${
            v.startIso && v.laufzeit !== "monatlich"
              ? `Aktuelle Periode: ${berechnePeriode(v.startIso, v.laufzeit)}`
              : ""
          }
        </td>
      `;
      tbody.appendChild(detail);

      row.addEventListener("click", () => {
        if (detail) {
          detail.style.display = detail.style.display === "none" ? "table-row" : "none";
        }
      });

      row.querySelector(".btn-loeschen").addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = parseInt(e.currentTarget.getAttribute("data-id"), 10);
        if (Number.isNaN(id)) return;
        try {
          const response = await fetch(apiUrl(`/api/contracts/${id}`), { method: "DELETE" });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          ladeVertraege();
        } catch (error) {
          console.error("Vertrag konnte nicht gelöscht werden:", error);
          alert("Vertrag konnte nicht gelöscht werden.");
        }
      });

      row.querySelector(".btn-bearbeiten").addEventListener("click", (e) => {
        e.stopPropagation();
        editModus = true;
        editID = v.id;
        if (nameInput) nameInput.value = v.name;
        if (kostenInput) kostenInput.value = v.kosten;
        if (intervallInput) intervallInput.value = v.intervall;
        if (startdatumInput) startdatumInput.value = v.startAnzeige;
        if (laufzeitInput) laufzeitInput.value = v.laufzeit;
        if (speichernButton) speichernButton.textContent = "💾 Speichern";
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
    console.error("Fehler beim Laden der Verträge:", error);
  }
}

if (form && speichernButton && nutzerDropdown && nameInput && kostenInput && intervallInput && laufzeitInput) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nutzerId = nutzerDropdown.value;
    const name = nameInput.value.trim();
    const kosten = parseFloat(kostenInput.value);
    const intervall = intervallInput.value;
    const startdatumRoh = startdatumInput?.value.trim() || "";
    const laufzeit = laufzeitInput.value;

    if (!nutzerId || !name || Number.isNaN(kosten)) {
      alert("Bitte gültige Vertragsdaten eingeben.");
      return;
    }

    const startIso = parseInputDate(startdatumRoh);
    const payload = {
      user_id: Number(nutzerId),
      name,
      cost: kosten,
      interval: intervall,
      start_date: startIso,
      term: laufzeit,
    };

    try {
      const response = await fetch(apiUrl("/api/contracts"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (editModus && editID) {
        try {
          const deleteResponse = await fetch(apiUrl(`/api/contracts/${editID}`), { method: "DELETE" });
          if (!deleteResponse.ok) {
            throw new Error(`HTTP ${deleteResponse.status}`);
          }
        } catch (error) {
          console.error("Alter Vertrag konnte nicht gelöscht werden:", error);
        }
      }

      form.reset();
      nutzerDropdown.value = String(nutzerId);
      if (speichernButton) speichernButton.textContent = "✚ Hinzufügen";
      editModus = false;
      editID = null;
      ladeVertraege();
    } catch (error) {
      console.error("Vertrag konnte nicht gespeichert werden:", error);
      alert("Vertrag konnte nicht gespeichert werden.");
    }
  });
}

ladeNutzer();
});
