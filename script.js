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
      document.getElementById("locationStatus").innerText = `Your location: ${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    },
    err => {
      alert("Location access denied.");
    }
  );
}

// 📤 Post help request
form.addEventListener("submit", e => {
  e.preventDefault();
  const task = document.getElementById("task").value;
  const time = document.getElementById("time").value;
  const reward = document.getElementById("reward").value;

  const request = {
    id: Date.now(),
    task, time, reward,
    lat: lat ?? "Not shared",
    lon: lon ?? "Not shared"
  };

  let all = JSON.parse(localStorage.getItem("helpRequests") || "[]");
  all.push(request);
  localStorage.setItem("helpRequests", JSON.stringify(all));
  form.reset();
  loadRequests();
});

// 📚 Load Help Requests
function loadRequests() {
  requestsDiv.innerHTML = "";
  const all = JSON.parse(localStorage.getItem("helpRequests") || "[]");

  all.forEach(req => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${req.task}</strong><br>
      Time: ${req.time}<br>
      ${req.reward ? `<span class="reward-badge">Reward: ₹${req.reward}</span>` : `<span class="reward-badge">No Reward</span>`}
      <button onclick="acceptTask(${req.id})">Accept</button>
    `;
    requestsDiv.appendChild(div);
    observer.observe(div);
  });
}

// ✅ Accept Task
function acceptTask(id) {
  let accepted = JSON.parse(localStorage.getItem("myTasks") || "[]");
  const all = JSON.parse(localStorage.getItem("helpRequests") || "[]");
  const task = all.find(r => r.id === id);
  if (task) {
    accepted.push(task);
    localStorage.setItem("myTasks", JSON.stringify(accepted));
    loadMyTasks();
    scheduleReminder(task);
  }
}

// ⏰ Simulate Background Task Reminder
function scheduleReminder(task) {
  const now = new Date();
  const [hh, mm] = task.time.split(":");
  const taskTime = new Date();
  taskTime.setHours(+hh, +mm, 0);

  const delay = taskTime.getTime() - now.getTime();

  if (delay > 0) {
    setTimeout(() => {
      alert(`🔔 Reminder: Your task "${task.task}" is scheduled for now.`);
    }, delay);
  }
}

// 👁️ Intersection Observer for card animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, {
  threshold: 0.1
});

// 📦 Load accepted tasks
function loadMyTasks() {
  myTasksDiv.innerHTML = "";
  const accepted = JSON.parse(localStorage.getItem("myTasks") || "[]");

  accepted.forEach(t => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${t.task}</strong><br>
      Scheduled at: ${t.time}<br>
      <small>📍 ${t.lat}, ${t.lon}</small>
    `;
    myTasksDiv.appendChild(div);
    observer.observe(div);
  });
}

// 🚀 Initialize
loadRequests();
loadMyTasks();
