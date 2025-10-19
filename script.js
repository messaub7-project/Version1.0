import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// === CONFIG FIREBASE ===
const firebaseConfig = {
  apiKey: "AIzaSyBTn5Yo0ZPPMRgv8-PySNHKiNDlO2NgyAc",
  authDomain: "avis-sur-moi.firebaseapp.com",
  projectId: "avis-sur-moi",
  storageBucket: "avis-sur-moi.firebasestorage.app",
  messagingSenderId: "960880952759",
  appId: "1:960880952759:web:abe2e931332b59b2039432"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// === DOM ELEMENTS ===
const landingSection = document.getElementById("landingSection");
const mainSection = document.getElementById("mainSection");
const registerBtn = document.getElementById("registerSubmit");
const loginBtn = document.getElementById("loginSubmit");
const logoutBtn = document.getElementById("logoutBtn");
const userNameDisplay = document.getElementById("userName");

const adminSection = document.getElementById("adminSection");
const userSection = document.getElementById("userSection");

const createEventBtn = document.getElementById("createEventBtn");
const eventTitleInput = document.getElementById("eventTitle");
const adminEventsList = document.getElementById("adminEvents");
const userEventsList = document.getElementById("userEvents");

const sendMessageBtn = document.getElementById("sendMessageBtn");
const messageInput = document.getElementById("messageInput");
const messagesList = document.getElementById("messagesList");
const messageSection = document.getElementById("messageSection");
const messageTitle = document.getElementById("messageTitle");
const messageInputContainer = document.getElementById("messageInputContainer");

const adminMessagesList = document.getElementById("adminMessagesList");
const toggleEmailsBtn = document.getElementById("toggleEmailsBtn");

// === VARIABLES GLOBALES ===
let currentUser = null;
let isAdmin = false;
let selectedEventId = null;
let hideEmails = false;

// === HELPERS ===
function showAppContainer() {
  landingSection.style.display = "none";
  mainSection.style.display = "block";
}
function showLanding() {
  landingSection.style.display = "flex";
  mainSection.style.display = "none";
}

// === AUTHENTIFICATION ===
registerBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!email || !password) return alert("Email et mot de passe requis !");
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Compte créé !");
  } catch (err) {
    alert(err.message);
  }
});

loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!email || !password) return alert("Email et mot de passe requis !");
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert(err.message);
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  showLanding();
});

// === SURVEILLANCE DE L'AUTH ===
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    isAdmin = user.email === "messaub7@gmail.com";
    userNameDisplay.textContent = user.email;
    showAppContainer();

    if (isAdmin) {
      adminSection.style.display = "block";
      userSection.style.display = "none";
      loadAdminEvents();
    } else {
      adminSection.style.display = "none";
      userSection.style.display = "block";
      loadUserEvents();
    }
  } else {
    currentUser = null;
    showLanding();
  }
});

// === CRÉATION D'ÉVÉNEMENTS ===
createEventBtn.addEventListener("click", async () => {
  const title = eventTitleInput.value.trim();
  if (!title) return alert("Nom requis !");
  await addDoc(collection(db, "events"), { title, createdAt: new Date() });
  eventTitleInput.value = "";
  alert("Événement créé !");
  loadAdminEvents();
});

// === CHARGEMENT DES ÉVÉNEMENTS ===
async function loadAdminEvents() {
  adminEventsList.innerHTML = "";
  const snap = await getDocs(collection(db, "events"));
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.innerHTML = `<strong>${data.title}</strong>
                    <button class="delete-btn">Supprimer</button>
                    <button class="view-btn">Voir messages</button>`;
    li.querySelector(".delete-btn").addEventListener("click", async () => {
      if (confirm(`Supprimer "${data.title}" ?`)) {
        await deleteDoc(doc(db, "events", docSnap.id));
        loadAdminEvents();
      }
    });
    li.querySelector(".view-btn").addEventListener("click", () =>
      selectEvent(docSnap.id, data.title)
    );
    adminEventsList.appendChild(li);
  });
}

async function loadUserEvents() {
  userEventsList.innerHTML = "";
  const snap = await getDocs(collection(db, "events"));
  snap.forEach((docSnap) => {
    const li = document.createElement("li");
    li.textContent = docSnap.data().title;
    li.style.cursor = "pointer";
    li.onclick = () => selectEvent(docSnap.id, docSnap.data().title);
    userEventsList.appendChild(li);
  });
}

// === SÉLECTION D'UN ÉVÉNEMENT ===
function selectEvent(eventId, title) {
  selectedEventId = eventId;
  messageSection.style.display = "block";

  if (isAdmin) {
    messageTitle.textContent = `Messages de tous pour "${title}"`;
    messageInputContainer.style.display = "none";
  } else {
    messageTitle.textContent = `Messages pour "${title}"`;
    messageInputContainer.style.display = "block";
    messageInput.disabled = false;
    sendMessageBtn.disabled = false;
  }

  loadMessages(eventId);
}

// === ENVOI DE MESSAGE ===
sendMessageBtn.addEventListener("click", async () => {
  if (!selectedEventId) return alert("Sélectionne un événement !");
  const text = messageInput.value.trim();
  if (!text) return;
  await addDoc(collection(db, "messages"), {
    text,
    userId: currentUser.uid,
    userEmail: currentUser.email,
    eventId: selectedEventId,
    deleted: false,
    createdAt: new Date()
  });
  messageInput.value = "";
});

// === CHARGEMENT DES MESSAGES ===
function loadMessages(eventId) {
  messagesList.innerHTML = "";
  adminMessagesList.innerHTML = "";

  let q = query(
    collection(db, "messages"),
    where("eventId", "==", eventId),
    orderBy("createdAt", "asc")
  );

  if (!isAdmin) q = query(q, where("eventId", "==", eventId), where("userId", "==", currentUser.uid), orderBy("createdAt", "asc"));

  onSnapshot(q, (snapshot) => {
    messagesList.innerHTML = "";
    adminMessagesList.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      if (isAdmin) {
        const li = document.createElement("li");
        const displayEmail = hideEmails ? "XXXX" : data.userEmail;
        li.innerHTML = data.deleted
          ? `<em style="color:gray;">Message supprimé</em>`
          : `<strong>${displayEmail} :</strong> ${data.text}`;
        adminMessagesList.appendChild(li);
      } else {
        const li = document.createElement("li");
        li.innerHTML = data.deleted
          ? `<em style="color:gray;">Message supprimé</em>`
          : `<strong>${data.userEmail} :</strong> ${data.text}`;
        messagesList.appendChild(li);
      }
    });
  });
}

// === TOGGLE EMAILS ADMIN ===
if (toggleEmailsBtn) {
  toggleEmailsBtn.addEventListener("click", () => {
    hideEmails = !hideEmails;
    if (selectedEventId) loadMessages(selectedEventId);
  });
}
