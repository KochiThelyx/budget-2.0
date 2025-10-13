const HOUSEHOLD_ID = "kochithelyx-home";
const MEMBERS = ["Philipp", "Franni"];
const TASKS = [
  { name: "Staubputzen Wohnung", freq: "biweekly", minGapWeeks: 1 },
  { name: "Bad sauber machen", freq: "weekly", minGapWeeks: 1 },
  { name: "Staubsaugen vorbereiten (Staubi…)", freq: "weekly", minGapWeeks: 1 },
  { name: "Treppe draußen fegen & wischen", freq: "biweekly", minGapWeeks: 1 },
  { name: "Küche sauber machen", freq: "weekly", minGapWeeks: 1 },
  { name: "Fenster putzen", freq: "monthly", minGapWeeks: 3 },
  { name: "Bettbezüge wechseln & alte waschen", freq: "biweekly", minGapWeeks: 1 },
  { name: "Balkon putzen", freq: "monthly", minGapWeeks: 3 },
  { name: "Herd saubermachen", freq: "biweekly", minGapWeeks: 1 },
  { name: "Kühlschrank auswischen", freq: "monthly", minGapWeeks: 3 },
];

const SETTINGS_KEY = "putzsonntag_settings";
const HISTORY_KEY = "putzsonntag_history";

const DEFAULT_SETTINGS = {
  householdId: HOUSEHOLD_ID,
  members: MEMBERS,
  tasks: TASKS,
};

function cloneDefaults() {
  return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
}

const freqLimitMap = {
  weekly: Infinity,
  biweekly: 2,
  monthly: 1,
};

const freqLabelMap = {
  weekly: "wöchentlich",
  biweekly: "14-tägig",
  monthly: "monatlich",
};

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function seededRandFactory(seedStr) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let state = h >>> 0;
  return function rand() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

function randShuffle(array, rand) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getISOWeek(date) {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
  return { year: tmp.getUTCFullYear(), week };
}

function isoWeekToDate(year, week) {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dow = simple.getUTCDay();
  const isoWeekStart = new Date(simple);
  const diff = dow === 0 ? -6 : 1 - dow;
  isoWeekStart.setUTCDate(simple.getUTCDate() + diff);
  return isoWeekStart;
}

function weeksBetween(currentYear, currentWeek, otherYear, otherWeek) {
  const current = isoWeekToDate(currentYear, currentWeek);
  const other = isoWeekToDate(otherYear, otherWeek);
  return Math.round((current - other) / MS_PER_WEEK);
}

function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) {
      return cloneDefaults();
    }
    const parsed = JSON.parse(saved);
    const householdId = typeof parsed.householdId === "string" && parsed.householdId.trim() ? parsed.householdId.trim() : DEFAULT_SETTINGS.householdId;
    const members = Array.isArray(parsed.members) && parsed.members.length ? parsed.members.map(String).filter(Boolean) : DEFAULT_SETTINGS.members;
    const tasks = Array.isArray(parsed.tasks) && parsed.tasks.length ? parsed.tasks.map((task) => ({
      name: String(task.name || "").trim(),
      freq: ["weekly", "biweekly", "monthly"].includes(task.freq) ? task.freq : "weekly",
      minGapWeeks: Number.isFinite(Number(task.minGapWeeks)) ? Math.max(0, Number(task.minGapWeeks)) : 0,
    })).filter((task) => task.name) : DEFAULT_SETTINGS.tasks;
    return { householdId, members, tasks };
  } catch (error) {
    console.warn("Fehler beim Laden der Einstellungen, verwende Defaults", error);
    return cloneDefaults();
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const history = JSON.parse(raw);
    if (!Array.isArray(history)) return [];
    return history
      .filter((entry) => entry && typeof entry.year === "number" && typeof entry.isoWeek === "number" && Array.isArray(entry.assignments))
      .sort((a, b) => weekSortValue(b.year, b.isoWeek) - weekSortValue(a.year, a.isoWeek));
  } catch (error) {
    console.warn("Fehler beim Laden der History", error);
    return [];
  }
}

function saveHistory(history) {
  const trimmed = history
    .filter((entry) => entry && typeof entry.year === "number" && typeof entry.isoWeek === "number" && Array.isArray(entry.assignments))
    .sort((a, b) => weekSortValue(b.year, b.isoWeek) - weekSortValue(a.year, a.isoWeek))
    .slice(0, 8);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

function weekSortValue(year, week) {
  return year * 100 + week;
}

function countInLastNWeeks(taskName, history, currentIso, spanWeeks) {
  return history.reduce((count, entry) => {
    if (entry.year === currentIso.year && entry.isoWeek === currentIso.week) return count;
    const diff = weeksBetween(currentIso.year, currentIso.week, entry.year, entry.isoWeek);
    if (diff > 0 && diff < spanWeeks) {
      const occurred = entry.assignments.some((assignment) => assignment.task === taskName);
      return occurred ? count + 1 : count;
    }
    return count;
  }, 0);
}

function findLastAssignment(taskName, history, currentIso) {
  let result = null;
  for (const entry of history) {
    if (entry.year === currentIso.year && entry.isoWeek === currentIso.week) continue;
    const diff = weeksBetween(currentIso.year, currentIso.week, entry.year, entry.isoWeek);
    if (diff > 0) {
      const wasAssigned = entry.assignments.find((assignment) => assignment.task === taskName);
      if (wasAssigned) {
        result = { diff, entry };
        break;
      }
    }
  }
  return result;
}

function evaluateTask(task, history, currentIso) {
  const reasons = [];
  const lastAssignment = findLastAssignment(task.name, history, currentIso);
  if (lastAssignment && lastAssignment.diff <= task.minGapWeeks) {
    const { entry, diff } = lastAssignment;
    reasons.push(`zuletzt KW ${entry.isoWeek} · ${entry.year} – Abstand ${diff} Woche(n), benötigt > ${task.minGapWeeks}`);
  }

  const limit = freqLimitMap[task.freq] ?? Infinity;
  if (Number.isFinite(limit)) {
    const count = countInLastNWeeks(task.name, history, currentIso, 4);
    if (count >= limit) {
      const label = task.freq === "biweekly" ? "14-tägig" : "monatlich";
      reasons.push(`${label}: in den letzten 4 Wochen bereits ${count}× vergeben`);
    }
  }

  return { eligible: reasons.length === 0, reasons };
}

function computePlan(settings, history, currentIso) {
  const rand = seededRandFactory(`${settings.householdId}:${currentIso.year}-KW${currentIso.week}`);
  const eligible = [];

  for (const task of settings.tasks) {
    const evaluation = evaluateTask(task, history, currentIso);
    if (evaluation.eligible) {
      eligible.push(task);
    }
  }

  const shuffledEligible = randShuffle([...eligible], rand);
  const selectedTasks = shuffledEligible.slice(0, settings.members.length);
  const assignmentTasks = [...selectedTasks];
  while (assignmentTasks.length < settings.members.length) {
    assignmentTasks.push({ name: "Frei/Joker", freq: "placeholder", minGapWeeks: 0 });
  }

  const rotationIndex = settings.members.length ? Math.floor(rand() * settings.members.length) : 0;
  const rotatedMembers = rotationIndex
    ? [...settings.members.slice(rotationIndex), ...settings.members.slice(0, rotationIndex)]
    : [...settings.members];

  const assignments = rotatedMembers.map((member, index) => ({
    member,
    task: assignmentTasks[index] ? assignmentTasks[index].name : "Frei/Joker",
  }));

  return { assignments };
}

function upsertHistoryEntry(history, iso, assignments) {
  const filtered = history.filter((entry) => !(entry.year === iso.year && entry.isoWeek === iso.week));
  const snapshot = assignments.map((item) => ({ member: item.member, task: item.task }));
  filtered.unshift({ year: iso.year, isoWeek: iso.week, assignments: snapshot });
  return filtered;
}

function renderAssignments(tbody, assignments) {
  tbody.innerHTML = "";
  assignments.forEach(({ member, task }) => {
    const tr = document.createElement("tr");
    const memberCell = document.createElement("td");
    memberCell.textContent = member;
    const taskCell = document.createElement("td");
    taskCell.className = "assignment-task";
    taskCell.textContent = task;
    if (task === "Frei/Joker") {
      const note = document.createElement("span");
      note.className = "task-note";
      note.textContent = "Keine passende Aufgabe frei";
      taskCell.appendChild(note);
    }
    tr.append(memberCell, taskCell);
    tbody.appendChild(tr);
  });
}

function populateMembersEditor(container, members) {
  container.innerHTML = "";
  members.forEach((name, index) => {
    const row = document.createElement("div");
    row.className = "list-row";
    const input = document.createElement("input");
    input.type = "text";
    input.value = name;
    input.required = true;
    input.placeholder = `Mitglied ${index + 1}`;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "icon-button";
    remove.textContent = "🗑️";
    remove.addEventListener("click", () => {
      row.remove();
      if (!container.children.length) {
        addMemberRow(container, "");
      }
    });
    row.append(input, remove);
    container.appendChild(row);
  });
  if (!container.children.length) {
    addMemberRow(container, "");
  }
}

function addMemberRow(container, value = "") {
  const row = document.createElement("div");
  row.className = "list-row";
  const input = document.createElement("input");
  input.type = "text";
  input.value = value;
  input.placeholder = `Mitglied ${container.children.length + 1}`;
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "icon-button";
  remove.textContent = "🗑️";
  remove.addEventListener("click", () => {
    row.remove();
    if (!container.children.length) {
      addMemberRow(container, "");
    }
  });
  row.append(input, remove);
  container.appendChild(row);
  input.focus();
}

function populateTasksEditor(container, tasks) {
  container.innerHTML = "";
  tasks.forEach((task) => {
    container.appendChild(createTaskRow(task));
  });
  if (!container.children.length) {
    container.appendChild(createTaskRow({ name: "", freq: "weekly", minGapWeeks: 0 }));
  }
}

function createTaskRow(task) {
  const row = document.createElement("div");
  row.className = "list-row";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.value = task.name || "";
  nameInput.placeholder = "Aufgabe";

  const freqSelect = document.createElement("select");
  ["weekly", "biweekly", "monthly"].forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = freqLabelMap[value];
    if (task.freq === value) {
      option.selected = true;
    }
    freqSelect.appendChild(option);
  });

  const gapInput = document.createElement("input");
  gapInput.type = "number";
  gapInput.min = "0";
  gapInput.value = task.minGapWeeks ?? 0;
  gapInput.style.width = "6ch";
  gapInput.title = "minimale Wochen Abstand";

  const freqContainer = document.createElement("div");
  freqContainer.className = "freq-inputs";
  const freqLabel = document.createElement("span");
  freqLabel.textContent = "Frequenz";
  const gapLabel = document.createElement("span");
  gapLabel.textContent = "min. Abstand";
  freqContainer.append(freqLabel, freqSelect, gapLabel, gapInput);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "icon-button";
  remove.textContent = "🗑️";
  remove.addEventListener("click", () => {
    const parent = row.parentElement;
    row.remove();
    if (parent && !parent.children.length) {
      parent.appendChild(createTaskRow({ name: "", freq: "weekly", minGapWeeks: 0 }));
    }
  });

  row.append(nameInput, freqContainer, remove);
  return row;
}

function collectMembers(container) {
  const values = [];
  container.querySelectorAll("input[type='text']").forEach((input) => {
    const value = input.value.trim();
    if (value) {
      values.push(value);
    }
  });
  return values;
}

function collectTasks(container) {
  const tasks = [];
  container.querySelectorAll(".list-row").forEach((row) => {
    const [nameInput, freqContainer] = row.children;
    if (!nameInput || !freqContainer) return;
    const name = nameInput.value.trim();
    if (!name) return;
    const freqSelect = freqContainer.querySelector("select");
    const gapInput = freqContainer.querySelector("input[type='number']");
    tasks.push({
      name,
      freq: freqSelect ? freqSelect.value : "weekly",
      minGapWeeks: gapInput ? Math.max(0, Number(gapInput.value) || 0) : 0,
    });
  });
  return tasks;
}

function init() {
  const weekDisplay = document.getElementById("week-display");
  const assignmentBody = document.getElementById("assignment-body");
  const recalcBtn = document.getElementById("recalc-btn");
  const settingsBtn = document.getElementById("settings-btn");
  const settingsDialog = document.getElementById("settings-dialog");
  const membersEditor = document.getElementById("members-editor");
  const tasksEditor = document.getElementById("tasks-editor");
  const addMemberBtn = document.getElementById("add-member");
  const addTaskBtn = document.getElementById("add-task");
  const cancelSettingsBtn = document.getElementById("cancel-settings");
  const saveSettingsBtn = document.getElementById("save-settings");
  const householdInput = document.getElementById("household-id-input");

  let settings = loadSettings();
  let history = loadHistory();
  const todayIso = getISOWeek(new Date());
  weekDisplay.textContent = `KW ${todayIso.week} · ${todayIso.year}`;

  function refresh() {
    history = loadHistory();
    settings = loadSettings();

    const plan = computePlan(settings, history, todayIso);
    renderAssignments(assignmentBody, plan.assignments);
    history = upsertHistoryEntry(history, todayIso, plan.assignments);
    saveHistory(history);
  }

  recalcBtn.addEventListener("click", () => {
    refresh();
  });

  settingsBtn.addEventListener("click", () => {
    householdInput.value = settings.householdId;
    populateMembersEditor(membersEditor, settings.members);
    populateTasksEditor(tasksEditor, settings.tasks);
    settingsDialog.showModal();
  });

  addMemberBtn.addEventListener("click", () => {
    addMemberRow(membersEditor, "");
  });

  addTaskBtn.addEventListener("click", () => {
    tasksEditor.appendChild(createTaskRow({ name: "", freq: "weekly", minGapWeeks: 0 }));
  });

  cancelSettingsBtn.addEventListener("click", () => {
    settingsDialog.close();
  });

  saveSettingsBtn.addEventListener("click", (event) => {
    event.preventDefault();
    const householdId = householdInput.value.trim() || DEFAULT_SETTINGS.householdId;
    const members = collectMembers(membersEditor);
    const tasks = collectTasks(tasksEditor);
    if (!members.length) {
      window.alert("Bitte mindestens ein Mitglied angeben.");
      return;
    }
    if (!tasks.length) {
      window.alert("Bitte mindestens eine Aufgabe anlegen.");
      return;
    }
    const newSettings = { householdId, members, tasks };
    saveSettings(newSettings);
    settings = newSettings;
    settingsDialog.close();
    refresh();
  });

  settingsDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    settingsDialog.close();
  });

  refresh();
}

init();
