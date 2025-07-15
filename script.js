let lat, lon;
const form = document.getElementById("helpForm");
const requestsDiv = document.getElementById("requests");
const myTasksDiv = document.getElementById("myTasks");

function getLocation() {
  navigator.geolocation.getCurrentPosition(
    pos => {
      lat = pos.coords.latitude;
      lon = pos.coords.longitude;
      document.getElementById("locationStatus").innerText = `📍 ${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    },
    err => {
      alert("Location access denied.");
    }
  );
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const task = document.getElementById("task").value;
  const time = document.getElementById("time").value;
  const reward = document.getElementById("reward").value;

  const request = {
    id: Date.now(),
    task,
    time,
    reward: reward || "No Reward",
    lat: lat ?? "Not shared",
    lon: lon ?? "Not shared"
  };

  let all = JSON.parse(localStorage.getItem("helpRequests") || "[]");
  all.push(request);
  localStorage.setItem("helpRequests", JSON.stringify(all));
  form.reset();
  loadRequests();
  playConfetti();
  playDing();
});

function loadRequests() {
  requestsDiv.innerHTML = "";
  const all = JSON.parse(localStorage.getItem("helpRequests") || "[]");
  const accepted = JSON.parse(localStorage.getItem("myTasks") || "[]");
  const acceptedIds = accepted.map(t => t.id);

  all.forEach(req => {
    if (!acceptedIds.includes(req.id)) {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <strong>${req.task}</strong><br>
        Time: ${req.time}<br>
        <span class="reward-badge">${req.reward}</span><br>
        <button onclick="acceptTask(${req.id})">Accept</button>
      `;
      requestsDiv.appendChild(div);
      observer.observe(div);
    }
  });
}

function acceptTask(id) {
  let accepted = JSON.parse(localStorage.getItem("myTasks") || "[]");
  let all = JSON.parse(localStorage.getItem("helpRequests") || "[]");
  const task = all.find(r => r.id === id);
  if (task) {
    accepted.push(task);
    localStorage.setItem("myTasks", JSON.stringify(accepted));
    const updatedAll = all.filter(r => r.id !== id);
    localStorage.setItem("helpRequests", JSON.stringify(updatedAll));
    loadRequests();
    loadMyTasks();
    scheduleReminder(task);
    playConfetti();
    playDing();
  }
}

function removeAcceptedTask(id) {
  let accepted = JSON.parse(localStorage.getItem("myTasks") || "[]");
  accepted = accepted.filter(t => t.id !== id);
  localStorage.setItem("myTasks", JSON.stringify(accepted));
  loadMyTasks();
  loadRequests(); // show back in nearby (optional)
}

function scheduleReminder(task) {
  const now = new Date();
  const [hh, mm] = task.time.split(":");
  const taskTime = new Date();
  taskTime.setHours(+hh, +mm, 0);

  const delay = taskTime.getTime() - now.getTime();
  if (delay > 0 && delay < 4 * 60 * 60 * 1000) {
    setTimeout(() => {
      alert(`⏰ Reminder: Your task "${task.task}" is scheduled now.`);
      playDing();
      playConfetti();
    }, delay);
  }
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.1 });

function playConfetti() {
  if (window.confetti) {
    window.confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

function playDing() {
  const audio = document.getElementById("ding");
  if (audio) audio.play();
}

function loadMyTasks() {
  myTasksDiv.innerHTML = "";
  const accepted = JSON.parse(localStorage.getItem("myTasks") || "[]");

  accepted.forEach(t => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${t.task}</strong><br>
      Scheduled at: ${t.time}<br>
      <small>📍 ${t.lat}, ${t.lon}</small><br>
      <button onclick="removeAcceptedTask(${t.id})">🗑️ Remove</button>
    `;
    myTasksDiv.appendChild(div);
    observer.observe(div);
  });
}

loadRequests();
loadMyTasks();
