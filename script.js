let lat, lon;
const form = document.getElementById("helpForm");
const requestsDiv = document.getElementById("requests");
const myTasksDiv = document.getElementById("myTasks");

// 📍 Get user location
function getLocation() {
  navigator.geolocation.getCurrentPosition(
    pos => {
      lat = pos.coords.latitude;
      lon = pos.coords.longitude;
      document.getElementById("locationStatus").innerText =
        `📍 Location saved: ${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    },
    err => {
      alert("Location access denied.");
    }
  );
}

// 🎉 Effects
function playConfetti() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }
}

function playDing() {
  const audio = document.getElementById("ding");
  if (audio) audio.play();
}

// 📤 Post Help Request
form.addEventListener("submit", e => {
  e.preventDefault();
  const task = document.getElementById("task").value;
  const time = document.getElementById("time").value;
  const reward = document.getElementById("reward").value;

  const request = {
    id: Date.now(),
    task,
    time,
    reward,
    lat: lat ?? "Not shared",
    lon: lon ?? "Not shared"
  };

  let all = JSON.parse(localStorage.getItem("helpRequests") || "[]");
  all.push(request);
  localStorage.setItem("helpRequests", JSON.stringify(all));
  form.reset();
  loadRequests();
});

// 📚 Load Requests (excluding accepted)
function loadRequests() {
  requestsDiv.innerHTML = "";
  const all = JSON.parse(localStorage.getItem("helpRequests") || "[]");
  const accepted = JSON.parse(localStorage.getItem("myTasks") || "[]");
  const acceptedIds = accepted.map(t => t.id);

  const visibleRequests = all.filter(t => !acceptedIds.includes(t.id));

  visibleRequests.forEach(req => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${req.task}</strong><br>
      Time: ${req.time}<br>
      ${req.reward ? `<span class="reward-badge">Reward: ₹${req.reward}</span>` : `<span class="reward-badge">No Reward</span>`}
      <button class="accept-btn" onclick="acceptTask(${req.id})">Accept</button>
    `;
    requestsDiv.appendChild(div);
    observer.observe(div);
  });
}

// ✅ Accept Task
function acceptTask(id) {
  let accepted = JSON.parse(localStorage.getItem("myTasks") || "[]");
  let all = JSON.parse(localStorage.getItem("helpRequests") || "[]");

  const task = all.find(t => t.id === id);
  if (!task) return;

  accepted.push(task);
  localStorage.setItem("myTasks", JSON.stringify(accepted));

  // Remove from helpRequests
  const remaining = all.filter(t => t.id !== id);
  localStorage.setItem("helpRequests", JSON.stringify(remaining));

  playConfetti();
  playDing();
  loadRequests();
  loadMyTasks();
  scheduleReminder(task);
}

// 🧹 Remove Accepted Task
function removeTask(index) {
  let tasks = JSON.parse(localStorage.getItem("myTasks") || "[]");
  tasks.splice(index, 1);
  localStorage.setItem("myTasks", JSON.stringify(tasks));
  loadMyTasks();
  loadRequests(); // refresh nearby requests too
}

// ⏰ Reminder
function scheduleReminder(task) {
  const now = new Date();
  const [hh, mm] = task.time.split(":");
  const taskTime = new Date();
  taskTime.setHours(+hh, +mm, 0, 0);

  const delay = taskTime.getTime() - now.getTime();

  if (delay > 0 && delay < 6 * 60 * 60 * 1000) {
    setTimeout(() => {
      alert(`🔔 Reminder: Your task "${task.task}" is scheduled now.`);
      playConfetti();
      playDing();
    }, delay);
  }
}

// 👁️ Animate on Scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.1 });

// 📦 Load Accepted Tasks
function loadMyTasks() {
  myTasksDiv.innerHTML = "";
  const accepted = JSON.parse(localStorage.getItem("myTasks") || "[]");

  accepted.forEach((t, i) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${t.task}</strong><br>
      Scheduled at: ${t.time}<br>
      <small>📍 ${t.lat}, ${t.lon}</small><br>
      <button class="accept-btn" onclick="removeTask(${i})">❌ Remove</button>
    `;
    myTasksDiv.appendChild(div);
    observer.observe(div);
  });
}

// 🚀 Initialize
loadRequests();
loadMyTasks();
