window.onload = loadTasks;

// ==========================
// API URL
// ==========================
const API_URL = "http://192.168.0.17:5000/api";

// ==========================
// ADD TASK
// ==========================
async function addTask() {

  const text =
    document
      .getElementById("taskInput")
      .value
      .trim();

  const priority =
    document
      .getElementById("prioritySelect")
      .value;

  const deadline =
    document
      .getElementById("deadlineInput")
      .value;

  if (!text) {
    alert("Digite uma tarefa");
    return;
  }

  const task = {
    text,
    priority,
    deadline
  };

  try {

    const response =
      await fetch(API_URL, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(task)

      });

    const savedTask =
      await response.json();

    createTask(savedTask);

    // limpa inputs
    document.getElementById("taskInput").value = "";

    document.getElementById("prioritySelect").value = "Alta";

    document.getElementById("deadlineInput").value = "";

    updateCounters();

  } catch (error) {

    console.error(error);

    alert("Erro ao adicionar tarefa");

  }
}

// ==========================
// LOAD TASKS
// ==========================
async function loadTasks() {

  try {

    const response =
      await fetch(API_URL);

    const tasks =
      await response.json();

    // limpa grid
    document.getElementById("taskList").innerHTML = "";

    // cria cards
    tasks.forEach(task => {

      createTask(task);

    });

    updateCounters();

  } catch (error) {

    console.error(error);

  }
}

// ==========================
// CREATE CARD
// ==========================
function createTask(task) {

  const list =
    document.getElementById("taskList");

  const card =
    document.createElement("div");

  card.className = "task-item";

  // datasets
  card.dataset.id =
    task._id;

  card.dataset.priority =
    task.priority;

  card.dataset.deadline =
    task.deadline || "";

  card.dataset.done =
    task.done.toString();

  // badge
  const badgeClass =
    task.priority === "Alta"
      ? "badge-alta"
      : task.priority === "Média"
      ? "badge-media"
      : "badge-baixa";

  // html
  card.innerHTML = `

    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-start mb-2">

      <!-- PRIORITY -->
      <span class="badge ${badgeClass}">
        ${task.priority}
      </span>

      <!-- DROPDOWN -->
      <div class="dropdown">

        <button
          class="btn btn-sm btn-dark border-0"
          type="button"
          data-bs-toggle="dropdown">

          ⋮

        </button>

        <ul class="dropdown-menu dropdown-menu-dark">

          <!-- EDIT -->
          <li>

            <button
              class="dropdown-item"
              onclick="openEditModal(this.closest('.task-item'))">

              Editar

            </button>

          </li>

          <!-- REMOVE -->
          <li>

            <button
              class="dropdown-item text-danger"
              onclick="removeTask(this.closest('.task-item'))">

              Remover

            </button>

          </li>

        </ul>

      </div>

    </div>

    <!-- TITLE -->
    <div class="task-title ${task.done ? "completed" : ""}">
      ${task.text}
    </div>

    <!-- DATE -->
    <div class="task-date">

      ${
        task.deadline
          ? formatDate(task.deadline)
          : "Sem prazo"
      }

    </div>

    <!-- STATUS -->
    <div class="task-status">

      ${
        task.done
          ? finalizada()
          : getDeadlineStatus(task.deadline)
      }

    </div>

    <!-- CHECKBOX -->
    <div class="form-check mt-3">

      <input
        type="checkbox"
        class="form-check-input"
        ${task.done ? "checked" : ""}
        onchange="toggleTask(this.closest('.task-item'), this.checked)">

    </div>

  `;

  list.appendChild(card);

  sortTasks();
}

// ==========================
// OPEN EDIT MODAL
// ==========================
function openEditModal(card) {

  // pega dados
  const id =
    card.dataset.id;

  const text =
    card.querySelector(".task-title")
    .innerText;

  const priority =
    card.dataset.priority;

  const deadline =
    card.dataset.deadline;

  // preenche modal
  document.getElementById("editTaskId").value =
    id;

  document.getElementById("editTaskText").value =
    text;

  document.getElementById("editTaskPriority").value =
    priority;

  document.getElementById("editTaskDeadline").value =
    deadline;

  // abre modal
  const modal =
    new bootstrap.Modal(
      document.getElementById("editModal")
    );

  modal.show();
}

// ==========================
// SAVE EDIT TASK
// ==========================
async function saveEditTask() {

  const id =
    document.getElementById("editTaskId").value;

  const text =
    document.getElementById("editTaskText").value;

  const priority =
    document.getElementById("editTaskPriority").value;

  const deadline =
    document.getElementById("editTaskDeadline").value;

  try {

    await fetch(`${API_URL}/${id}`, {

      method: "PUT",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        text,
        priority,
        deadline,
        done: false

      })

    });

    // fecha modal
    bootstrap.Modal
      .getInstance(
        document.getElementById("editModal")
      )
      .hide();

    // recarrega tasks
    await loadTasks();

  } catch (error) {

    console.error(error);

    alert("Erro ao editar tarefa");

  }
}

// ==========================
// REMOVE TASK
// ==========================
async function removeTask(card) {

  const id =
    card.dataset.id;

  try {

    await fetch(`${API_URL}/${id}`, {

      method: "DELETE"

    });

    card.remove();

    updateCounters();

  } catch (error) {

    console.error(error);

    alert("Erro ao remover tarefa");

  }
}

// ==========================
// TOGGLE TASK
// ==========================
async function toggleTask(card, done) {

  const id =
    card.dataset.id;

  try {

    await fetch(`${API_URL}/${id}`, {

      method: "PUT",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        text:
          card.querySelector(".task-title")
          .innerText,

        priority:
          card.dataset.priority,

        deadline:
          card.dataset.deadline,

        done

      })

    });

    // atualiza dataset
    card.dataset.done =
      done.toString();

    const title =
      card.querySelector(".task-title");

    const status =
      card.querySelector(".task-status");

    if (done) {

      title.classList.add("completed");

      status.innerHTML =
        finalizada();

    } else {

      title.classList.remove("completed");

      status.innerHTML =
        getDeadlineStatus(
          card.dataset.deadline
        );
    }

    updateCounters();

  } catch (error) {

    console.error(error);

    alert("Erro ao atualizar tarefa");

  }
}

// ==========================
// SORT TASKS
// ==========================
function sortTasks() {

  const list =
    document.getElementById("taskList");

  const cards = [
    ...document.querySelectorAll(".task-item")
  ];

  const order = {

    Alta: 1,
    Média: 2,
    Baixa: 3

  };

  cards.sort((a, b) => {

    return (
      order[a.dataset.priority]
      -
      order[b.dataset.priority]
    );

  });

  cards.forEach(card => {

    list.appendChild(card);

  });
}

// ==========================
// UPDATE COUNTERS
// ==========================
function updateCounters() {

  const tasks =
    document.querySelectorAll(".task-item");

  const done =
    document.querySelectorAll(
      ".task-item[data-done='true']"
    );

  // total
  document.getElementById("totalTasks")
    .innerText = tasks.length;

  // concluídas
  document.getElementById("doneTasks")
    .innerText = done.length;

  // %
  const percent =
    tasks.length
      ? (done.length / tasks.length) * 100
      : 0;

  document.getElementById("progressBar")
    .style.width = percent + "%";
}

// ==========================
// FORMAT DATE
// ==========================
function formatDate(date) {

  if (!date)
    return "Sem prazo";

  const p =
    date.split("-");

  return `${p[2]}/${p[1]}/${p[0]}`;
}

// ==========================
// DEADLINE STATUS
// ==========================
function getDeadlineStatus(date) {

  if (!date)
    return "";

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  // atrasada
  if (date < today) {

    return `
      <span class="text-danger fw-semibold">
        Atrasada
      </span>
    `;
  }

  // hoje
  if (date === today) {

    return `
      <span class="text-warning fw-semibold">
        Hoje
      </span>
    `;
  }

  // prazo ok
  return `
    <span class="text-success fw-semibold">
      No prazo
    </span>
  `;
}

// ==========================
// FINALIZADA
// ==========================
function finalizada() {

  return `
    <span class="text-primary fw-semibold">
      Finalizada
    </span>
  `;
}